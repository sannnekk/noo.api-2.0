import { Service } from '../../Core/Services/Service.js';
import { BlogPostRepository } from '../Data/BlogPostRepository.js';
import { Pagination } from '../../Core/Data/Pagination.js';
import { BlogPostModel } from '../Data/BlogPostModel.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { QueryFailedError } from 'typeorm';
import { AlreadyExistError } from '../../Core/Errors/AlreadyExistError.js';
import { UnknownError } from '../../Core/Errors/UnknownError.js';
import { BlogPostReactionRepository } from '../Data/Relations/BlogPostReactionRepository.js';
import { BlogPostReactionModel } from '../Data/Relations/BlogPostReactionModel.js';
export class BlogService extends Service {
    repository;
    reactionRepository;
    constructor() {
        super();
        this.repository = new BlogPostRepository();
        this.reactionRepository = new BlogPostReactionRepository();
    }
    async getAll(pagination, userId) {
        const relations = ['author', 'poll'];
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = BlogPostModel.entriesToSearch();
        const posts = await this.repository.find(undefined, relations, pagination);
        const meta = await this.getRequestMeta(this.repository, undefined, pagination, relations);
        const reactions = await this.reactionRepository.find(posts.map((post) => ({
            post: { id: post.id },
            user: { id: userId },
        })));
        const reactionsMap = new Map();
        reactions.forEach((reaction) => {
            reactionsMap.set(reaction.postId, reaction.reaction);
        });
        posts.forEach((post) => {
            post.myReaction = reactionsMap.get(post.id);
        });
        return { posts, meta };
    }
    async getById(id, userId) {
        const relations = ['author'];
        const post = await this.repository.findOne({ id }, relations);
        if (!post) {
            throw new NotFoundError('Пост не найден');
        }
        if (userId) {
            const reaction = await this.reactionRepository.findOne({
                post: { id },
                user: { id: userId },
            });
            if (reaction) {
                post.myReaction = reaction.reaction;
            }
        }
        return post;
    }
    async toggleReaction(postId, userId, reaction) {
        const post = await this.getById(postId);
        if (!post) {
            throw new NotFoundError('Пост не найден');
        }
        const reactionCounts = post.reactionCounts;
        const reactionCount = reactionCounts[reaction];
        if (reactionCount === undefined) {
            throw new UnknownError('Неизвестная реакция');
        }
        const existingReaction = await this.reactionRepository.findOne({
            post: { id: postId },
            user: { id: userId },
        });
        if (!existingReaction) {
            reactionCounts[reaction] = reactionCount + 1;
            const newReaction = new BlogPostReactionModel({
                post: { id: postId },
                user: { id: userId },
                reaction,
            });
            await this.reactionRepository.create(newReaction);
            const updatedPost = await this.repository.update({
                id: postId,
                reactionCounts,
            });
            return updatedPost.reactionCounts;
        }
        const oldReaction = existingReaction.reaction;
        if (oldReaction === reaction) {
            reactionCounts[reaction] = reactionCount - 1;
            await this.reactionRepository.delete(existingReaction.id);
        }
        else {
            reactionCounts[oldReaction] = reactionCounts[oldReaction] - 1;
            reactionCounts[reaction] = reactionCounts[reaction] + 1;
            await this.reactionRepository.update({
                id: existingReaction.id,
                reaction,
            });
        }
        const updatedPost = await this.repository.update({
            id: postId,
            reactionCounts,
        });
        return updatedPost.reactionCounts;
    }
    async create(post, authorId) {
        try {
            post.reactionCounts = {
                like: 0,
                dislike: 0,
                happy: 0,
                sad: 0,
                mindblowing: 0,
            };
            post.author = { id: authorId };
            return await this.repository.create(post);
        }
        catch (error) {
            if (error instanceof QueryFailedError) {
                throw new AlreadyExistError();
            }
            throw new UnknownError();
        }
    }
    async update(post) {
        const blogPost = await this.getById(post.id);
        // cant update a poll
        post.poll = undefined;
        post.author = undefined;
        if (!blogPost) {
            throw new NotFoundError('Пост не найден');
        }
        const updatedPost = new BlogPostModel({ ...blogPost, ...post });
        await this.repository.update(updatedPost);
    }
    async delete(id) {
        const blogPost = await this.getById(id);
        if (!blogPost) {
            throw new NotFoundError('Пост не найден');
        }
        await this.repository.delete(id);
    }
}
