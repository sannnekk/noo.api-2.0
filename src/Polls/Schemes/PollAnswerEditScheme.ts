import { PollAnswerScheme } from './PollAnswerScheme'

export const PollAnswerEditScheme = PollAnswerScheme.omit({
  userAuthType: true,
  userAuthData: true,
})
