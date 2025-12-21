import type {
  CheckSessionInput,
  CheckSessionResult,
  ProvideFeedbackInput,
  ProvideFeedbackResult,
  RequestFeedbackInput,
  RequestFeedbackResult,
  ResetSessionResult,
} from "./types";

export interface CouncilService {
  requestFeedback(input: RequestFeedbackInput): Promise<RequestFeedbackResult>;
  checkSession(input: CheckSessionInput): Promise<CheckSessionResult>;
  provideFeedback(input: ProvideFeedbackInput): Promise<ProvideFeedbackResult>;
  resetSession(): Promise<ResetSessionResult>;
}

export class CouncilServiceImpl implements CouncilService {
  async requestFeedback(_input: RequestFeedbackInput): Promise<RequestFeedbackResult> {
    throw new Error("Not implemented");
  }

  async checkSession(_input: CheckSessionInput): Promise<CheckSessionResult> {
    throw new Error("Not implemented");
  }

  async provideFeedback(_input: ProvideFeedbackInput): Promise<ProvideFeedbackResult> {
    throw new Error("Not implemented");
  }

  async resetSession(): Promise<ResetSessionResult> {
    throw new Error("Not implemented");
  }
}
