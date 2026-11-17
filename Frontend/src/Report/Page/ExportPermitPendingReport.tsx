import { reportConfigs } from '../config/reportConfigs';
import GenericReportPage from './GenericReportPage';

const ExportPermitPendingReport = () => (
  <GenericReportPage config={reportConfigs.ExportPermitPendingReport} />
);

export default ExportPermitPendingReport;
