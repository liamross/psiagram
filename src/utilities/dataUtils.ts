/**
 * Set the data-workflow-type of an element.
 */
export const setWorkflowType = (
  element: Element,
  workflowType: WorkflowType,
) => {
  element.setAttribute('data-workflow-type', workflowType);
};

export enum WorkflowType {
  Paper = 'paper',
  Node = 'node',
  Edge = 'edge',
}
