import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Space, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import axiosInstance from '../../services/AxiosInstance';
import { AnyObject } from '../../types/AnyObject';
import { BasicTableColumn } from '../../components/My Components/Table/BasicTable';
import { reportConfigs } from '../config/reportConfigs';
import GenericReportPage from './GenericReportPage';

interface HistoryRow {
  id: string;
  createdDate: string | null;
  remark: string | null;
}

const TurndownRemark = ({
  value,
  width,
}: {
  value: unknown;
  width?: number;
}) => (
  <Typography.Paragraph
    className="turndown-remark"
    ellipsis={{
      rows: 3,
      expandable: 'collapsible',
      symbol: (expanded) => (expanded ? 'Show less' : 'Show more'),
    }}
    style={{
      width,
      maxWidth: '100%',
      margin: 0,
      whiteSpace: 'pre-wrap',
      overflowWrap: 'anywhere',
    }}
  >
    {String(value ?? '').trim() || 'Remark unavailable'}
  </Typography.Paragraph>
);

const ImportLicenceTurndownReport = ({
  border = false,
}: {
  border?: boolean;
}) => {
  const config =
    reportConfigs[`${border ? 'Border' : ''}ImportLicenceTurndownReport`];
  const [selected, setSelected] = useState<AnyObject | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const pending = useRef<AbortController | null>(null);

  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => {
    pending.current?.abort();
    setSelected(null);
  }, [border]);

  const loadHistory = useCallback(
    async (row: AnyObject) => {
      pending.current?.abort();
      const controller = new AbortController();
      pending.current = controller;
      setSelected(row);
      setHistory([]);
      setError(false);
      setLoading(true);
      try {
        const response = await axiosInstance.get<HistoryRow[]>(
          `${config.apiRoute}/History/${encodeURIComponent(String(row.id))}`,
          { signal: controller.signal }
        );
        if (!controller.signal.aborted) setHistory(response.data);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [config.apiRoute]
  );

  const cellRenderers = useMemo<
    Record<string, BasicTableColumn<AnyObject>['render']>
  >(
    () => ({
      TurndownCount: (value, row) => (
        <Button
          type="link"
          onClick={() => {
            if (selected?.id === row.id) {
              pending.current?.abort();
              setSelected(null);
            } else {
              void loadHistory(row);
            }
          }}
          aria-label={`View ${String(value)} turndowns for ${String(row.applicationNo)}`}
          aria-expanded={selected?.id === row.id}
          aria-controls={`turndown-history-${String(row.id)}`}
        >
          {String(value)}
        </Button>
      ),
      TurndownRemark: (value) => <TurndownRemark value={value} width={280} />,
    }),
    [loadHistory, selected?.id]
  );

  return (
    <GenericReportPage
      key={config.controllerName}
      config={config}
      cellRenderers={cellRenderers}
      renderExpandedRow={(row) =>
        selected?.id === row.id ? (
          <div
            id={`turndown-history-${String(row.id)}`}
            role="region"
            aria-label={`Turndown history for ${String(row.applicationNo)}`}
            style={{
              position: 'sticky',
              left: 0,
              width: 850,
              maxWidth: 'calc(100vw - 80px)',
              padding: 16,
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Typography.Title level={5} style={{ margin: 0 }}>
                Turndown History — {String(row.applicationNo)}
              </Typography.Title>
              <Typography.Text>
                Complete history across all dates. Recorded count:{' '}
                {String(selected?.turndownCount ?? 0)}.
              </Typography.Text>
              {error ? (
                <Alert
                  type="error"
                  showIcon
                  message="Could not load turndown history."
                  action={
                    <Button
                      onClick={() => selected && void loadHistory(selected)}
                    >
                      Retry
                    </Button>
                  }
                />
              ) : (
                <Table<HistoryRow>
                  rowKey="id"
                  dataSource={history}
                  loading={loading}
                  pagination={false}
                  scroll={{ x: 600, y: 440 }}
                  locale={{ emptyText: 'No turndown history found.' }}
                  columns={[
                    {
                      title: 'No.',
                      width: 60,
                      render: (_value, _row, index) => index + 1,
                    },
                    {
                      title: 'Turndown Date / Created Date',
                      dataIndex: 'createdDate',
                      width: 210,
                      render: (value: string | null) =>
                        value
                          ? dayjs(value).format('DD/MM/YYYY HH:mm:ss')
                          : 'Date unavailable',
                    },
                    {
                      title: 'Remark',
                      dataIndex: 'remark',
                      render: (value: string | null) => (
                        <TurndownRemark value={value} />
                      ),
                    },
                  ]}
                />
              )}
              <Typography.Text type="secondary">
                Only turndown events with a recorded remark are included in this
                count and history.
              </Typography.Text>
            </Space>
          </div>
        ) : null
      }
    />
  );
};

export default ImportLicenceTurndownReport;
