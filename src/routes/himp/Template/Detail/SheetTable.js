import React from 'react';
import { Form, Input, Popconfirm, Row, Col, Button, Select } from 'hzero-ui';
import { connect } from 'dva';
import { Link } from 'dva/router';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';

import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';

import { addItemToPagination, delItemToPagination, tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';

const viewMessagePrompt = 'himp.template.view.message';
const commonPrompt = 'hzero.common';

@connect(({ template, loading }) => ({
  template,
  loading: {
    queryLines: loading.effects['template/queryLines'],
  },
}))
export default class SheetTable extends React.Component {
  @Bind()
  handleCreateSheet() {
    const {
      dispatch,
      template: { templateTargetList = [], templateTargetPagination },
    } = this.props;
    dispatch({
      type: 'template/updateState',
      payload: {
        templateTargetList: [
          {
            _status: 'create',
            id: uuid(),
            sheetIndex: '',
            sheetName: '',
            datasourceId: '',
            tableName: '',
            ruleScriptCode: '',
            enabledFlag: 1,
          },
          ...templateTargetList,
        ],
        templateTargetPagination: addItemToPagination(
          templateTargetList.length,
          templateTargetPagination
        ),
      },
    });
  }

  /**
   * handleDeleteSheet - 删除未保存的行，分页减少1
   * @param {object} record - 行数据
   */
  @Bind()
  handleDeleteSheet(record) {
    const {
      dispatch,
      template: { templateTargetList = [], pagination },
    } = this.props;
    const newList = templateTargetList.filter(item => item.id !== record.id);
    dispatch({
      type: 'template/updateState',
      payload: {
        templateTargetList: newList,
        pagination: delItemToPagination(templateTargetList.length, pagination),
      },
    });
  }

  /**
   * handleSheetEdit - 设置行数据的编辑状态
   * @param {object} record - 行数据
   * @param {boolean} flag - 编辑标识
   */
  @Bind()
  handleSheetEdit(record, flag) {
    const {
      template: { templateTargetList = [] },
      dispatch,
    } = this.props;
    const newList = templateTargetList.map(item => {
      if (record.id === item.id) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'template/updateState',
      payload: { templateTargetList: newList },
    });
  }

  render() {
    const {
      template: { templateTargetList = [], templateTargetPagination = {}, code = {} },
      detailId,
      templateType,
    } = this.props;
    const columns = [
      {
        title: '页序号',
        width: 200,
        dataIndex: 'sheetIndexMeaning',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('sheetIndex', {
                  initialValue: `${record.sheetIndex}`,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: '页序号',
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: 150 }}>
                    {(code['HIMP.IMPORT_SHEET'] || []).map(n => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: '页名称',
        width: 200,
        dataIndex: 'sheetName',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('sheetName', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: '页名称',
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: '数据源',
        dataIndex: 'datasourceDesc',
        width: 200,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('datasourceId', {
                  initialValue: record.datasourceId,
                  rules: [
                    {
                      required: templateType === 'S',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: '数据源',
                      }),
                    },
                  ],
                })(
                  <Lov
                    allowClear={false}
                    textValue={record.datasourceDesc}
                    code="HPFM.DATASOURCE"
                    queryParams={{ enabledFlag: 1, dsPurposeCode: 'DI' }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: '正式数据表名',
        dataIndex: 'tableName',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('tableName', {
                  initialValue: val,
                  rules: [
                    {
                      required: templateType === 'S',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: '正式数据表名',
                      }),
                    },
                  ],
                })(<Input inputChinese={false} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: '效验规则',
        dataIndex: 'scriptDescription',
        width: 200,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('ruleScriptCode', {
                  initialValue: record.ruleScriptCode,
                })(
                  <Lov
                    allowClear={false}
                    textValue={record.scriptDescription}
                    code="HIMP.IMPORT_SCRIPT"
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag,
                })(<Checkbox />)}
              </Form.Item>
            );
          } else {
            return enableRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        render: (val, record) => {
          if (record._status === 'update') {
            return (
              <a onClick={() => this.handleSheetEdit(record, false)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            );
          } else if (record._status === 'create') {
            return (
              <Popconfirm
                title={intl.get(`${viewMessagePrompt}.title.confirmDelete`).d('确定删除?')}
                onConfirm={() => this.handleDeleteSheet(record)}
                style={{ textAlign: 'center' }}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            );
          } else {
            return (
              <span className="action-link">
                <a onClick={() => this.handleSheetEdit(record, true)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
                {record.id !== undefined && (
                  <Link to={`/himp/template/column/${detailId}/${record.id}`}>维护模板列</Link>
                )}
              </span>
            );
          }
        },
      },
    ];
    return (
      <React.Fragment>
        <Row style={{ marginBottom: 10 }}>
          <Col>
            <Button onClick={this.handleCreateSheet} type="primary" icon="plus">
              {/* // FIXME: 国际化 + 按钮调整 */}
              新建Sheet页
            </Button>
          </Col>
        </Row>
        <EditTable
          bordered
          rowKey="id"
          // FIXME: 这边的loading写死了?
          loading={false}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={templateTargetList}
          pagination={templateTargetPagination}
          // FIXME: 这边没有 loadLines 方法, 也没有继承
          onChange={page => this.loadLines(page)}
        />
      </React.Fragment>
    );
  }
}
