import React, { PureComponent, Fragment } from 'react';
import { Modal, Form, Input, Table, Popconfirm } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';
import Lov from 'components/Lov';

import intl from 'utils/intl';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 新建或编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onAdd - 添加确定的回调函数
 * @reactProps {Function} onEdit - 编辑确定的回调函数
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {Boolean} isCreate - 是否为新建账户
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  @Bind()
  onOk() {
    const { form, onAdd, isCreate, tableRecord, onEdit } = this.props;
    const { databaseId, objectVersionNumber, _token } = tableRecord;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        if (isCreate) {
          onAdd(values);
        } else {
          onEdit({ databaseId, objectVersionNumber, _token, ...values });
        }
      }
    });
  }

  /**
   * 选择租户
   *
   * @param {*} value
   * @memberof Drawer
   */
  @Bind()
  onSelectTenantOk(value) {
    const { onTenantOk } = this.props;
    onTenantOk(value);
  }

  /**
   * 删除租户
   *
   * @param {*} record
   * @memberof Drawer
   */
  @Bind()
  deleteTenantOk(record) {
    const { onDeleteTenant } = this.props;
    onDeleteTenant(record);
  }

  render() {
    const {
      visible,
      onCancel,
      saving,
      anchor,
      tableRecord,
      isCreate,
      databaseId,
      loading,
      establish,
      datasourceId,
      tenantData = {},
      tenantPagination,
      onChangeTenant,
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    const columns = [
      {
        title: intl.get('hpfm.database.model.database.tenantNum').d('租户编码'),
        dataIndex: 'tenantNum',
        width: 150,
      },
      {
        title: intl.get('hpfm.database.model.database.tenantName').d('租户名称'),
        dataIndex: 'tenantName',
        // width: 200,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        align: 'center',
        render: (val, record) => (
          <Popconfirm
            title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
            onConfirm={() => {
              this.deleteTenantOk(record);
            }}
          >
            <a>{intl.get('hezor.common.button.delete').d('删除')}</a>
          </Popconfirm>
        ),
      },
    ];
    return (
      <Modal
        destroyOnClose
        width={620}
        title={
          isCreate
            ? intl.get('hpfm.database.view.message.create').d('新建数据库')
            : intl.get('hpfm.database.view.message.edit').d('编辑数据库')
        }
        visible={visible}
        onCancel={onCancel}
        onOk={this.onOk}
        confirmLoading={saving}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        okText={
          establish
            ? intl.get('hzero.common.button.create').d('新建')
            : intl.get('hzero.common.button.save').d('保存')
        }
      >
        <Form>
          <FormItem
            label={intl.get('hpfm.database.model.database.databaseCode').d('数据库代码')}
            {...formLayout}
          >
            {getFieldDecorator('databaseCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.database.model.database.databaseCode').d('数据库代码'),
                  }),
                },
              ],
              initialValue: tableRecord ? tableRecord.databaseCode : '',
            })(<Input typeCase="upper" trim inputChinese={false} disabled={!isCreate} />)}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.database.model.database.databaseName').d('数据库名称')}
            {...formLayout}
          >
            {getFieldDecorator('databaseName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.database.model.database.dataSourceName').d('数据库名称'),
                  }),
                },
              ],
              initialValue: tableRecord ? tableRecord.databaseName : '',
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.database.model.database.datasourceId').d('数据源代码')}
            {...formLayout}
          >
            {getFieldDecorator('datasourceId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.database.model.database.datasourceId').d('数据源代码'),
                  }),
                },
              ],
              initialValue: tableRecord ? tableRecord.datasourceId : '',
            })(
              <Lov
                code="HPFM.DATASOURCE"
                textValue={tableRecord.datasourceCode}
                queryParams={{ enabledFlag: 1, dsPurposeCode: 'DT' }}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.database.model.database.description').d('数据源描述')}
            {...formLayout}
          >
            {getFieldDecorator('description', {
              rules: [
                {
                  required: false,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.database.model.database.description').d('数据源描述'),
                  }),
                },
              ],
              initialValue: tableRecord ? tableRecord.description : '',
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.database.model.database.tablePrefix').d('表前缀')}
            {...formLayout}
          >
            {getFieldDecorator('tablePrefix', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.database.model.database.tablePrefix').d('表前缀'),
                  }),
                },
              ],
              initialValue: tableRecord ? tableRecord.tablePrefix : '',
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.database.model.database.publicFlag').d('公共库标识')}
            {...formLayout}
          >
            {getFieldDecorator('publicFlag', {
              initialValue: isUndefined(tableRecord.publicFlag) ? 1 : tableRecord.publicFlag,
            })(<Switch />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: isUndefined(tableRecord.enabledFlag) ? 1 : tableRecord.enabledFlag,
            })(<Switch />)}
          </FormItem>
        </Form>
        {isUndefined(databaseId) ? (
          ''
        ) : (
          <Fragment>
            <Lov
              isButton
              type="primary"
              icon="plus"
              onOk={this.onSelectTenantOk}
              style={{ marginBottom: 18 }}
              code="HPFM.DATABASE.TENANT"
              queryParams={{ datasourceId }}
            >
              {intl.get('hzero.database.view.button.add').d('添加租户')}
            </Lov>
            <Table
              bordered
              columns={columns}
              dataSource={tenantData.content}
              rowKey="databaseTenantId"
              pagination={tenantPagination}
              onChange={page => onChangeTenant(page)}
              loading={loading}
            />
          </Fragment>
        )}
      </Modal>
    );
  }
}
