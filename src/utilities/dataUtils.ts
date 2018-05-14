const WORKFLOW_DATA_ATTRIBUTE = 'data-workflow-type';

/**
 * Set the data-workflow-type of an element to given WorkflowType.
 */
export const setWorkflowType = (
  element: Element,
  workflowType: WorkflowType,
): void => {
  element.setAttribute(WORKFLOW_DATA_ATTRIBUTE, workflowType);
};

/**
 * Check if a target element has a workflow data attribute matching given
 * WorkflowType.
 */
export const hasWorkflowType = (
  element: Element,
  workflowType: WorkflowType,
): boolean => {
  return getWorkflowType(element) === workflowType;
};

/**
 * Returns the WorkflowType of an element or empty string if it has none.
 */
export const getWorkflowType = (element: Element): WorkflowType | string => {
  return (element.getAttribute(WORKFLOW_DATA_ATTRIBUTE) as WorkflowType) || '';
};

/**
 * Possible values for workflow data attribute.
 */
export enum WorkflowType {
  Paper = 'paper',
  Node = 'node',
  Edge = 'edge',
}
