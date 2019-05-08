/**
 * AuthorityCopy - 租户级权限维护tab页 - 权限复制
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Table, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';

import Lov from 'components/Lov';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';
/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 租户级权限管理 - 权限复制
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityManagement - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@connect(({ authorityManagement, loading }) => ({
  authorityManagement,
  loading: loading.models.authorityManagement,
}))
export default class AuthorityCopy extends PureComponent {
  /**
   *Creates an instance of AuthorityCopy.
   * @param {Object} props 属性
   */
  constructor(props) {
    super(props);
    this.PageSize = 10;
    this.state = {
      newCreateRows: [],
    };
  }

  /**
   *增加一行
   */
  @Bind()
  addData() {
    const { dispatch } = this.props;
    const authorityLineId = `authorityLineId${uuidv4()}`;
    const data = {
      authorityLineId,
      isCreate: true,
      isEditing: true,
    };
    this.setState({
      newCreateRows: [...this.state.newCreateRows, data],
    });
    dispatch({
      type: 'authorityManagement/addNewData',
      payload: data,
    });
  }

  /**
   *行取消事件
   *
   * @param {Object} record 行数据
   */
  @Bind()
  cancel(record) {
    const { dispatch } = this.props;
    const { newCreateRows } = this.state;
    if (record.isCreate) {
      const listData = newCreateRows.filter(
        item => item.authorityLineId !== record.authorityLineId
      );
      this.setState({
        newCreateRows: listData,
      });
      dispatch({
        type: 'authorityManagement/removeNewAdd',
        payload: {},
      });
    } else {
      this.edit(record, false);
    }
  }

  /**
   *编辑事件
   *
   * @param {Object} record 行数据
   * @param {Boolean} flag 是否编辑状态标记
   */
  @Bind()
  edit(record = {}, flag) {
    const {
      dispatch,
      authorityManagement: { data = {} },
    } = this.props;
    const index = data.list.findIndex(item => item.authorityLineId === record.authorityLineId);
    dispatch({
      type: 'authorityManagement/editRow',
      payload: {
        data: [
          ...data.slice(0, index),
          {
            ...record,
            isEditing: flag,
          },
          ...data.slice(index + 1),
        ],
      },
    });
  }

  /**
   *保存数据
   */
  @Bind()
  dataSave() {
    const { form, dispatch, userId, refresh, authorityCopy } = this.props;
    const { newCreateRows } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        const arr = [];
        const isNewRowKeys = newCreateRows.filter(v => v.isEditing);
        isNewRowKeys.forEach(item => {
          arr.push(values[`${item.authorityLineId}#dataId`]);
        });
        dispatch({
          type: 'authorityManagement/copyAuthority',
          payload: {
            userId,
            copyUserIdList: arr,
          },
        }).then(response => {
          if (response) {
            notification.success();
            if (authorityCopy) {
              authorityCopy();
            }
            refresh();
          }
        });
      }
    });
  }

  /**
   *lov选中后渲染同行其他数据
   *
   * @param {Object} lovRecord
   * @param {Object} tableRecord
   */
  @Bind()
  setDataCode(lovRecord = {}, tableRecord = {}) {
    this.props.form.setFieldsValue({
      [`${tableRecord.authorityLineId}#dataCode`]: lovRecord.realName,
    });
  }

  /**
   *渲染事件
   *
   * @returns
   */
  render() {
    const { loading, organizationId, userId } = this.props;
    const { newCreateRows = [] } = this.state;
    const { getFieldDecorator } = this.props.form;
    const columns = [
      {
        title: intl.get('hiam.authorityManagement.model.authorityManagement.dataName').d('账号'),
        dataIndex: 'dataId',
        width: 200,
        render: (text, tableRecord) => {
          return tableRecord.isEditing ? (
            <FormItem>
              {getFieldDecorator(`${tableRecord.authorityLineId}#dataId`, {
                rules: [
                  {
                    required: true,
                  },
                ],
              })(
                <Lov
                  code="HIAM.USER_AUTHORITY_USER"
                  queryParams={{ organizationId, userId }}
                  textValue={text}
                  onChange={(_, record) => this.setDataCode(record, tableRecord)}
                />
              )}
            </FormItem>
          ) : (
            <div>{text}</div>
          );
        },
      },
      {
        title: intl.get('hiam.authorityManagement.model.authorityManagement.dataCode').d('描述'),
        dataIndex: 'dataCode',
        render: (text, record) => {
          return record.isEditing ? (
            <FormItem>
              {getFieldDecorator(`${record.authorityLineId}#dataCode`, {
                initialValue: record.dataCode,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            <div>{text}</div>
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        render: (_, record) => (
          <span className="action-link">
            <Popconfirm
              title={intl.get('smdm.paymentTerms.view.message.info').d('确认取消？')}
              onConfirm={() => this.cancel(record)}
            >
              <a>{intl.get('hzero.common.button.cancel').d('取消')}</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    return (
      <div>
        <div>
          <Button icon="plus" style={{ margin: '0 10px 10px 0' }} onClick={() => this.addData()}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" type="primary" onClick={() => this.dataSave()}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
        <div>
          {intl
            .get('hiam.authorityManagement.view.message.title.authorityCopy')
            .d('权限复制操作会将当前用户的权限一键添加至其他用户，请谨慎操作！')}
        </div>
        <Table
          bordered
          rowKey="authorityLineId"
          pagination={false}
          loading={loading}
          dataSource={newCreateRows}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </div>
    );
  }
}
