import GenericReportPage from './GenericReportPage';
import { reportConfigs } from '../config/reportConfigs';

const ApplicationNumberReport = () => (
  <GenericReportPage config={reportConfigs.ApplicationNumberReport} />
);
export default ApplicationNumberReport;
