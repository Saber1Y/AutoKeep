export interface TransferParams {
  chainId: number | string;
  recipientAddress: string;
  amount: string;
  tokenAddress?: string;
  tokenConfig?: string;
  gasLimitMultiplier?: string;
  simulate?: boolean;
}

export interface ContractCallParams {
  chainId: number | string;
  contractAddress: string;
  functionName: string;
  functionArgs?: string;
  abi?: string;
  value?: string;
  gasLimitMultiplier?: string;
  simulate?: boolean;
}

export interface ConditionSpec {
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte";
  value: string;
}

export interface CheckAndExecuteParams {
  chainId: number | string;
  contractAddress: string;
  functionName: string;
  functionArgs?: string;
  abi?: string;
  condition: ConditionSpec;
  action: Omit<ContractCallParams, "simulate">;
  simulate?: boolean;
}

export interface DirectExecutionStatus {
  executionId: string;
  status: "pending" | "running" | "completed" | "failed";
  type?: string;
  transactionHash?: string | null;
  transactionLink?: string | null;
  gasUsedWei?: string | null;
  result?: unknown;
  error?: string | null;
  createdAt?: string;
  completedAt?: string | null;
}

export interface WorkflowNodeData {
  label: string;
  config: Record<string, unknown>;
  description?: string;
}

export interface WorkflowNode {
  id: string;
  type: "trigger" | "action";
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  visibility?: string;
  enabled?: boolean;
  chain?: string | null;
  workflowType?: string | null;
  category?: string | null;
  priceUsdcPerCall?: string | null;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecutionTxHash {
  hash: string;
  nodeId?: string;
  nodeName?: string;
  chainId?: number;
  network?: string;
  iterationIndex?: number;
}

export interface ExecutionStatus {
  executionId: string;
  status: "pending" | "running" | "success" | "error" | "cancelled" | string;
  completed: boolean;
  transactionHashes?: ExecutionTxHash[];
  output?: unknown;
  error?: string | null;
  gasUsedWei?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  nodeStatuses?: { nodeId: string; status: string }[];
  progress?: {
    totalSteps: number;
    completedSteps: number;
    runningSteps: number;
    percentage: number;
  };
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: "pending" | "running" | "success" | "error" | "cancelled";
  input: Record<string, unknown>;
  output: Record<string, unknown> & { success?: boolean };
  error: string | null;
  duration: string;
  startedAt: string;
  completedAt: string | null;
  iterationIndex: number | null;
  forEachNodeId: string | null;
}

export interface ExecutionLogsResponse {
  execution: {
    id: string;
    workflowId: string;
    status: string;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    startedAt?: string;
    completedAt?: string;
    duration?: string;
    transactionHashes?: ExecutionTxHash[];
  };
  logs: ExecutionLog[];
}

export interface SimulateResult {
  success: boolean;
  status: string;
  from: string;
  to: string;
  value: string;
  gasEstimate: string;
  simulatedReturnValue: unknown;
  wouldRevert: boolean;
  revertReason?: string;
  error?: string;
  executed?: boolean;
}

export class KeeperHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly field?: string,
    readonly details?: string
  ) {
    super(message);
    this.name = "KeeperHubError";
  }
}

export class KeeperHubClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(apiKey: string, baseUrl = "https://app.keeperhub.com") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...extraHeaders,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let message = `KeeperHub request failed with status ${response.status}`;
      let code: string | undefined;
      let field: string | undefined;
      let details: string | undefined;
      try {
        const parsed = (await response.json()) as {
          error?: string;
          code?: string;
          field?: string;
          details?: string;
        } | null;
        if (parsed) {
          message = parsed.error ?? message;
          code = parsed.code;
          field = parsed.field;
          details = parsed.details;
        }
      } catch {
        // Response body was not JSON; keep the default message.
      }
      throw new KeeperHubError(message, response.status, code, field, details);
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  getOrganizationWalletAddress(): Promise<{ walletAddress: string }> {
    return this.request("GET", "/api/user");
  }

  listChains(): Promise<unknown> {
    return this.request("GET", "/api/chains");
  }

  getActionSchemas(): Promise<Record<string, unknown>> {
    return this.request("GET", "/api/mcp/schemas");
  }

  executeTransfer(params: TransferParams): Promise<DirectExecutionStatus | SimulateResult> {
    return this.request("POST", "/api/execute/transfer", params);
  }

  executeContractCall(params: ContractCallParams): Promise<DirectExecutionStatus | SimulateResult | { result: string }> {
    return this.request("POST", "/api/execute/contract-call", params);
  }

  executeCheckAndExecute(params: CheckAndExecuteParams): Promise<Record<string, unknown>> {
    return this.request("POST", "/api/execute/check-and-execute", params);
  }

  getDirectExecutionStatus(executionId: string): Promise<DirectExecutionStatus> {
    return this.request("GET", `/api/execute/${executionId}/status`);
  }

  createWorkflow(input: {
    name: string;
    description?: string;
    projectId?: string;
    tagId?: string;
    enabled?: boolean;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  }): Promise<WorkflowDefinition> {
    return this.request("POST", "/api/workflows/create", input);
  }

  updateWorkflow(
    workflowId: string,
    patch: {
      name?: string;
      description?: string;
      projectId?: string;
      tagId?: string;
      nodes?: WorkflowNode[];
      edges?: WorkflowEdge[];
      visibility?: string;
    }
  ): Promise<WorkflowDefinition> {
    return this.request("PATCH", `/api/workflows/${workflowId}`, patch);
  }

  deleteWorkflow(workflowId: string, force = false): Promise<void> {
    return this.request("DELETE", `/api/workflows/${workflowId}${force ? "?force=true" : ""}`);
  }

  getWorkflow(workflowId: string): Promise<WorkflowDefinition> {
    return this.request("GET", `/api/workflows/${workflowId}`);
  }

  listWorkflows(): Promise<WorkflowDefinition[]> {
    return this.request("GET", "/api/workflows");
  }

  executeWorkflow(workflowId: string, input: Record<string, unknown> = {}): Promise<{ executionId: string; status: string }> {
    return this.request("POST", `/api/workflows/${workflowId}/execute`, { input });
  }

  async getWorkflowExecutions(workflowId: string): Promise<ExecutionStatus[]> {
    const executions = await this.request<ExecutionStatus[]>(
      "GET",
      `/api/workflows/${workflowId}/executions`
    );
    return executions.map((execution) => {
      const raw = execution as ExecutionStatus & { id?: string };
      if (raw.id && !raw.executionId) {
        return { ...execution, executionId: raw.id };
      }
      return execution;
    });
  }

  getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
    return this.request("GET", `/api/workflows/executions/${executionId}/status`);
  }

  getExecutionLogs(executionId: string): Promise<ExecutionLogsResponse> {
    return this.request("GET", `/api/workflows/executions/${executionId}/logs`);
  }

  async waitForExecution(executionId: string, timeoutMs = 30000): Promise<ExecutionStatus> {
    const result = await this.request(
      "GET",
      `/api/workflows/executions/${executionId}/wait?timeoutMs=${timeoutMs}`
    );
    return result as ExecutionStatus;
  }
}
