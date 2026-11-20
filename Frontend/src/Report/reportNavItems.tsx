import { ReactNode } from 'react';
import { MenuProps } from 'antd';
import {
  BankOutlined,
  DollarOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  ImportOutlined,
  ExportOutlined,
  LoginOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  TeamOutlined,
  ShopOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  GoldOutlined,
  CarOutlined,
  ThunderboltOutlined,
  AuditOutlined,
  ContainerOutlined,
  ApartmentOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { reportConfigList } from './config/reportConfigs';

type ReportCategory = {
  key: string;
  title: string;
  icon: ReactNode;
  matches: (controllerName: string) => boolean;
};

const reportCategoryDefinitions: ReportCategory[] = [
  {
    key: 'report-member',
    title: 'Member',
    icon: <TeamOutlined />,
    matches: (controllerName) => controllerName === 'MemberRegistrationReport',
  },
  {
    key: 'report-pathaka',
    title: 'Pathaka',
    icon: <BankOutlined />,
    matches: (controllerName) =>
      [
        'PaThaKaRegisteredBusinessOrganizationReport',
        'ListOfValidAndInvalidCompany',
        'ListOfDirectorsByCompanyRegistrationNo',
        'ListOfTopCapitalCompany',
        'ListOfCompany',
        'ListOfDirectors',
        'RegistrationByVoucher',
        'RegistrationByBusinessType',
        'CompanyProfile',
        'EIRCardBindReport',
        'CardListsByCompanyRegistrationNumber',
      ].includes(controllerName),
  },
  {
    key: 'report-import-licence',
    title: 'Import Licence',
    icon: <ImportOutlined />,
    matches: (controllerName) => controllerName.startsWith('ImportLicence'),
  },
  {
    key: 'report-import-permit',
    title: 'Import Permit',
    icon: <LoginOutlined />,
    matches: (controllerName) => controllerName.startsWith('ImportPermit'),
  },
  {
    key: 'report-export-licence',
    title: 'Export Licence',
    icon: <ExportOutlined />,
    matches: (controllerName) => controllerName.startsWith('ExportLicence'),
  },
  {
    key: 'report-export-permit',
    title: 'Export Permit',
    icon: <LogoutOutlined />,
    matches: (controllerName) => controllerName.startsWith('ExportPermit'),
  },
  {
    key: 'report-border-import-licence',
    title: 'Border Import Licence',
    icon: <FileProtectOutlined />,
    matches: (controllerName) =>
      controllerName.startsWith('BorderImportLicence'),
  },
  {
    key: 'report-border-import-permit',
    title: 'Border Import Permit',
    icon: <SafetyCertificateOutlined />,
    matches: (controllerName) =>
      controllerName.startsWith('BorderImportPermit'),
  },
  {
    key: 'report-border-export-licence',
    title: 'Border Export Licence',
    icon: <FileDoneOutlined />,
    matches: (controllerName) =>
      controllerName.startsWith('BorderExportLicence'),
  },
  {
    key: 'report-border-export-permit',
    title: 'Border Export Permit',
    icon: <SafetyOutlined />,
    matches: (controllerName) =>
      controllerName.startsWith('BorderExportPermit'),
  },
  {
    key: 'report-wholesale',
    title: 'WholeSale',
    icon: <ShopOutlined />,
    matches: (controllerName) =>
      controllerName.startsWith('WholeSale') &&
      !controllerName.startsWith('WholeSaleAndRetail'),
  },
  {
    key: 'report-retail',
    title: 'Retail',
    icon: <ShoppingCartOutlined />,
    matches: (controllerName) => controllerName.startsWith('Retail'),
  },
  {
    key: 'report-wholesale-retail',
    title: 'Whole Sale and Retail',
    icon: <ShoppingOutlined />,
    matches: (controllerName) =>
      controllerName.startsWith('WholeSaleAndRetail'),
  },
  {
    key: 'report-alcoholic-beverages',
    title: 'Alcoholic Beverages Importation',
    icon: <GoldOutlined />,
    matches: (controllerName) =>
      controllerName.startsWith('AlcoholicBeveragesImportation'),
  },
  {
    key: 'report-duty-free-shop',
    title: 'Duty Free Shop',
    icon: <ContainerOutlined />,
    matches: (controllerName) => controllerName.startsWith('DutyFreeShop'),
  },
  {
    key: 'report-re-export',
    title: 'Re-Export',
    icon: <ExportOutlined />,
    matches: (controllerName) => controllerName.startsWith('ReExport'),
  },
  {
    key: 'report-business-service-agency',
    title: 'Business Service Agency',
    icon: <ApartmentOutlined />,
    matches: (controllerName) =>
      controllerName.startsWith('BusinessServiceAgency'),
  },
  {
    key: 'report-sale-center',
    title: 'Sale Center',
    icon: <BankOutlined />,
    matches: (controllerName) => controllerName.startsWith('SaleCenter'),
  },
  {
    key: 'report-show-room',
    title: 'Show Room',
    icon: <ShopOutlined />,
    matches: (controllerName) => controllerName.startsWith('ShowRoom'),
  },
  {
    key: 'report-evcycle-show-room',
    title: 'EVCycle Show Room',
    icon: <ThunderboltOutlined />,
    matches: (controllerName) =>
      controllerName.startsWith('EVCycleShowRoom'),
  },
  {
    key: 'report-ev-show-room',
    title: 'EV Show Room',
    icon: <CarOutlined />,
    matches: (controllerName) => controllerName.startsWith('EVShowRoom'),
  },
  {
    key: 'report-oga-recommendation',
    title: 'OGA Recommendation',
    icon: <AuditOutlined />,
    matches: (controllerName) =>
      controllerName.startsWith('OGARecommendation'),
  },
  {
    // Currently renders nothing: the three EICC configs set `hideInMenu` (owner's call,
    // 2026-09-14), and a category with no children is dropped below. Kept so unhiding them
    // is a one-line change in reportConfigs.ts rather than a nav edit as well.
    key: 'report-eicc',
    title: 'EICC',
    icon: <SafetyCertificateOutlined />,
    matches: (controllerName) => controllerName.startsWith('EICC'),
  },
  {
    key: 'report-payment',
    title: 'Payment',
    icon: <DollarOutlined />,
    matches: (controllerName) =>
      [
        'MPUReport',
        'ApplicationNumberReport',
        'ChequeNoReport',
        'ChequeNoDetailReport',
        'OnlineFeesReport',
        'AccountSummaryReport',
        'MPUReportV3',
        'MPUReportV4',
      ].includes(controllerName),
  },
  {
    // Last, which is where "Advance Search" sat in the old nav — straight after the Payment
    // entry (_Layout.cshtml:1262-1277 on origin/master). The old menu had ONE entry, opening
    // a page of eight tiles; the eight configs under this group are those tiles.
    key: 'report-advance-search',
    title: 'Advance Search',
    icon: <SearchOutlined />,
    matches: (controllerName) => controllerName.startsWith('AdvanceSearch'),
  },
];

const createReportItem = (config: (typeof reportConfigList)[number]) => ({
  key: config.controllerName,
  icon: <FileTextOutlined />,
  label: <Link to={`/Report/${config.controllerName}`}>{config.title}</Link>,
});

const hiddenReportKeys = new Set([
  'ChequeNoDetailReport',
  'DataImport',
  'ImportLicenceDataImport',
]);
const navReportConfigList = reportConfigList.filter(
  (config) =>
    !hiddenReportKeys.has(config.controllerName) && !config.hideInMenu
);

export const getReportCategoryKey = (controllerName: string) =>
  reportCategoryDefinitions.find((category) => category.matches(controllerName))
    ?.key;

export const reportCategoryKeys = reportCategoryDefinitions.map(
  (category) => category.key
);

export const reportNavItems: Required<MenuProps>['items'] = [
  {
    key: 'Exports',
    icon: <CloudDownloadOutlined />,
    label: <Link to="/Report/Exports">Exports</Link>,
  },
  {
    key: 'DataImport',
    icon: <CloudUploadOutlined />,
    label: <Link to="/Report/DataImport">Data Import</Link>,
  },
  ...reportCategoryDefinitions
    .map((category) => ({
      key: category.key,
      label: category.title,
      icon: category.icon,
      children: navReportConfigList
        .filter((config) => category.matches(config.controllerName))
        .map(createReportItem),
    }))
    .filter((category) => category.children.length > 0),
  ...navReportConfigList
    .filter((config) => !getReportCategoryKey(config.controllerName))
    .map(createReportItem),
];

export type ReportAccess = {
  isAdmin: boolean;
  categories: string[];
};

export const canAccessReportRoute = (
  access: ReportAccess,
  controllerName: string
): boolean => {
  if (access.isAdmin) return true;
  if (controllerName === 'Exports') return true;
  if (controllerName.endsWith('DataImport')) return false;

  const familyName = controllerName.startsWith('AdvanceSearch')
    ? controllerName.slice('AdvanceSearch'.length)
    : controllerName;
  const category = getReportCategoryKey(familyName);
  return category !== undefined && access.categories.includes(category);
};

export const getReportNavItems = (
  access: ReportAccess
): Required<MenuProps>['items'] =>
  reportNavItems.flatMap((item) => {
    if (!item) return [];
    if ('children' in item && Array.isArray(item.children)) {
      const children = item.children.filter(
        (child) => child && canAccessReportRoute(access, String(child.key))
      );
      return children.length ? [{ ...item, children }] : [];
    }
    return canAccessReportRoute(access, String(item.key)) ? [item] : [];
  });
