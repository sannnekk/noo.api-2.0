import { PollAnswerScheme } from './PollAnswerScheme.js';
export const PollAnswerEditScheme = PollAnswerScheme.omit({
    userAuthType: true,
    userAuthData: true,
});
