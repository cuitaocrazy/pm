import { ProjItemHandle } from './ProjItem';

export type ProjectReportData = {
  id: string;
  name: string;
  hours: number;
  contentOfWork: string;
  ref: React.RefObject<ProjItemHandle>;
};

export const run = <T>(action: () => void) => (o: T) => {
  action();
  return o;
};
