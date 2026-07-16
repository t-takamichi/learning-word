export interface IWordSetVisibilityChecker {
  isVisibleToUser(wordSetId: number, userId: number): boolean;
}
