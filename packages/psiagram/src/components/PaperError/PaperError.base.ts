/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * A PaperError thrown by an issue in Psiagram.
 */
export class PaperError extends Error {
  public name: string;
  public code: string;
  public fileName: string | undefined;
  public issuingFunction: string | undefined;

  /**
   * Initialize the error with an error code and optional properties.
   *
   * @param code Standardized code representing the error.
   * @param [message] Optional. Human-readable description of the error.
   * @param [fileName] Optional. Name of file error originated in.
   * @param [issuingFunction] Optional. Name of function issuing error.
   */
  constructor(
    code: string,
    message?: string,
    fileName?: string,
    issuingFunction?: string,
  ) {
    super(message);

    this.name = 'PaperError';
    this.code = code;
    this.fileName = fileName;
    this.issuingFunction = issuingFunction;
  }

  /**
   * A verbose string representing the specified PaperError object.
   */
  public toString(): string {
    const name = this.name;
    const code = this.code;
    const message = this.message ? `: ${this.message}` : '';
    const functionFile =
      this.fileName || this.issuingFunction
        ? ` (${
            this.fileName && this.issuingFunction
              ? `${this.fileName} - ${this.issuingFunction}`
              : `${this.fileName || this.issuingFunction}`
          })`
        : '';

    return `${name} ${code}${message}${functionFile}`;
  }
}
