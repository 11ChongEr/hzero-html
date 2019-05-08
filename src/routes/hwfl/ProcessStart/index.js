/**
 * ProcessStart - 流程设置/流程启动
 * @date: 2018-8-21
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
// FIXME: withRouter 看 withRouter 是否是必需的
import { withRouter } from 'dva/router';
import { Button, Form, Input } from 'hzero-ui';
import { filter, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';

import notification from 'utils/notification';
import uuid from 'uuid/v4';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import ListTable from './ListTable';
import Drawer from './Drawer';

const formLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 6 },
};

/**
 * 流程启动组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} processVariable - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ processStart }) => ({
  processStart,
  tenantId: getCurrentOrganizationId(),
}))
@withRouter
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hwfl.processStart', 'hwfl.common'] })
export default class ProcessStart extends PureComponent {
  state = {
    visible: false, // 模态框是否可见
    selectedRowKeys: [], // 选中行
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'processStart/updateState',
      payload: { variables: [] },
    });
  }

  // 打开新增模态框
  @Bind()
  showModal() {
    this.setState({
      visible: true,
    });
  }

  // 关闭模态框
  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
    });
  }

  // 保存模态框
  @Bind()
  handleAdd(values) {
    const {
      dispatch,
      processStart: { variables = [] },
    } = this.props;
    const newValue = {
      ...values,
      count: uuid(),
    };
    this.setState({
      visible: false,
    });
    dispatch({
      type: 'processStart/updateState',
      payload: { variables: [...variables, newValue] },
    });
  }

  // 获取选中行
  @Bind()
  getSelectedRowKeys(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    });
  }

  // 启动
  @Bind()
  processStart() {
    const {
      dispatch,
      tenantId,
      processStart: { variables = [] },
      form,
    } = this.props;
    const { selectedRowKeys } = this.state;
    const newVariables = variables.filter(item => selectedRowKeys.indexOf(item.count) >= 0);
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        dispatch({
          type: 'processStart/startProcess',
          payload: { ...values, tenantId, variables: newVariables },
        }).then(response => {
          if (response) {
            notification.success();
          }
          this.setState({
            selectedRowKeys: [],
          });
        });
      }
    });
  }

  // 删除
  @Bind()
  handleDelete(record) {
    const {
      dispatch,
      processStart: { variables = [] },
    } = this.props;
    // 当前删除数据的唯一标志
    const recordCount = record.count;
    // 根据唯一标志过滤出新数组
    const newVariables = filter(variables, item => {
      return recordCount.indexOf(item.count) < 0;
    });
    dispatch({
      type: 'processStart/updateState',
      payload: { variables: [...newVariables] },
    });
  }

  renderHeaderForm() {
    const {
      form: { getFieldDecorator },
      tenantId,
    } = this.props;
    return (
      <Form>
        <Form.Item
          label={intl.get('hwfl.processStart.model.processStart.employeeNum').d('模拟用户')}
          {...formLayout}
        >
          {getFieldDecorator('employeeNum', {})(
            <Lov code="HPFM.EMPLOYEE" queryParams={{ tenantId }} />
          )}
        </Form.Item>
        <Form.Item
          label={intl.get('hwfl.processStart.model.processStart.businessKey').d('业务主键')}
          {...formLayout}
        >
          {getFieldDecorator('businessKey', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hwfl.processStart.model.processStart.businessKey').d('业务主键'),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item
          label={intl.get('hwfl.common.model.process.define').d('流程定义')}
          {...formLayout}
        >
          {getFieldDecorator('processDefinitionId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hwfl.common.model.process.define').d('流程定义'),
                }),
              },
            ],
          })(<Lov code="HWFL.PRPCESS_DEFINITIONS" queryParams={{ tenantId }} />)}
        </Form.Item>
      </Form>
    );
  }

  render() {
    const {
      processStart: { variables },
      tenantId,
      form,
    } = this.props;
    const { visible, selectedRowKeys } = this.state;
    const tableProps = {
      variables,
      selectedRowKeys,
      onDelete: this.handleDelete,
      onSelectedKeys: this.getSelectedRowKeys,
    };
    const drawerProps = {
      visible,
      variables,
      tenantId,
      anchor: 'right',
      onCancel: this.handleCancel,
      onAdd: this.handleAdd,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.processStart.view.message.title').d('流程启动测试')}>
          <Button
            icon="caret-right"
            type="primary"
            onClick={this.processStart}
            disabled={isEmpty(form.getFieldValue('processDefinitionId'))}
          >
            {intl.get('hwfl.processStart.view.button.start').d('启动')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderHeaderForm()}</div>
          <div className="table-list-operator">
            <Button onClick={this.showModal} icon="plus">
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </div>
          <ListTable {...tableProps} />
        </Content>
        <Drawer {...drawerProps} />
      </React.Fragment>
    );
  }
}
