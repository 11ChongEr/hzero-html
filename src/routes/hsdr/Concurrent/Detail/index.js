/**
 * Concurrent-detail - 并发管理器/请求定义明细
 * @date: 2018-9-10
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Tabs, Row, Col } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import classNames from 'classnames';
import { isNumber, isArray, isEmpty } from 'lodash';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';
import Lov from 'components/Lov';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { EMAIL } from 'utils/regExp';
import ListTable from './ListTable';
import Drawer from './Drawer';
import styles from './index.less';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 审批规则头-行数据管理组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} concurrent - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hsdr.concurrent'] })
@Form.create({ fieldNameProp: null })
@connect(({ concurrent, loading }) => ({
  concurrent,
  fetchDetail: loading.effects['concurrent/fetchConcurrentDetail'],
  creating: loading.effects['concurrent/createConcurrent'],
  updating: loading.effects['concurrent/updateConcurrent'],
  tenantId: getCurrentOrganizationId(),
}))
export default class Detail extends Component {
  /**
   * state初始化
   */
  state = {
    targetItem: {}, // 表格中的一条记录
    disabled: false,
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    if (id !== 'create') {
      dispatch({
        type: 'concurrent/fetchConcurrentDetail',
        payload: {
          concurrentId: id,
        },
      });
    } else {
      dispatch({
        type: 'concurrent/updateState',
        payload: {
          concurrentDetail: {},
        },
      });
    }
  }

  /**
   * 新增参数
   */
  @Bind()
  handleAddLine() {
    const {
      concurrent: { paramFormatList = [], editTypeList = [] },
      dispatch,
    } = this.props;
    if (
      (isArray(paramFormatList) && isEmpty(paramFormatList)) ||
      (isArray(editTypeList) && isEmpty(editTypeList))
    ) {
      dispatch({
        type: 'concurrent/init',
      });
    }
    this.setState({ drawerVisible: true, targetItem: {} });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      form,
      match,
      tenantId,
      concurrent: { concurrentDetail = {} },
    } = this.props;
    const { paramList = [] } = concurrentDetail;
    form.validateFields((err, values) => {
      if (!err) {
        const anotherParameters = paramList.map(item => {
          return {
            ...item,
            concParamId: isNumber(item.concParamId) ? item.concParamId : null,
            tenantId,
          };
        });
        if (match.params.id === 'create') {
          dispatch({
            type: 'concurrent/createConcurrent', // 新增逻辑
            payload: {
              tenantId,
              concurrentId: null,
              paramList: [...anotherParameters],
              ...values,
            },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/hsdr/concurrent/detail/${res.concurrentId}`,
                })
              );
              dispatch({
                type: 'concurrent/updateState',
                payload: {
                  concurrentDetail: res,
                },
              });
            }
          });
        } else {
          dispatch({
            type: 'concurrent/updateConcurrent', // 更新逻辑
            payload: {
              tenantId,
              ...concurrentDetail,
              paramList: [...anotherParameters],
              ...values,
            },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch({
                type: 'concurrent/updateState',
                payload: {
                  concurrentDetail: res,
                },
              });
              // this.handleSearch();
            }
          });
        }
      }
    });
  }

  /**
   * 参数列表- 行编辑
   * @param {object} record - 规则对象
   */
  @Bind()
  handleEditContent(record) {
    const {
      concurrent: { paramFormatList = [], editTypeList = [] },
      dispatch,
    } = this.props;
    if (
      (isArray(paramFormatList) && isEmpty(paramFormatList)) ||
      (isArray(editTypeList) && isEmpty(editTypeList))
    ) {
      dispatch({
        type: 'concurrent/init',
      });
    }
    this.setState({ drawerVisible: true, targetItem: { ...record } });
  }

  /**
   * 参数列表- 行删除
   * @param {obejct} record - 规则对象
   */
  @Bind()
  handleDeleteContent(record) {
    const {
      dispatch,
      concurrent: { concurrentDetail = {} },
    } = this.props;
    const { paramList = [], ...otherValues } = concurrentDetail;
    const recordParameterId = record.concParamId;
    if (isNumber(recordParameterId)) {
      dispatch({
        type: 'concurrent/deleteLine',
        payload: record,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    } else {
      const newParamList = paramList.filter(item => recordParameterId !== item.concParamId);
      dispatch({
        type: 'concurrent/updateState',
        payload: {
          concurrentDetail: { paramList: [...newParamList], ...otherValues },
        },
      });
    }
  }

  /**
   * 新增滑窗保存操作
   * @param {object} values - 保存数据
   */
  @Bind()
  handleSaveContent(values) {
    const {
      dispatch,
      concurrent: { concurrentDetail = {} },
    } = this.props;
    const { paramList = [], ...otherValues } = concurrentDetail;
    const value = {
      concParamId: uuid(),
      ...values,
    };
    dispatch({
      type: 'concurrent/updateState',
      payload: {
        concurrentDetail: { paramList: [...paramList, value], ...otherValues },
      },
    });
    this.setState({ drawerVisible: false, targetItem: {} });
  }

  // 编辑保存滑窗
  @Bind()
  handleEditOk(values) {
    const {
      dispatch,
      concurrent: { concurrentDetail = {} },
    } = this.props;
    const { paramList = [], ...otherValues } = concurrentDetail;
    const newList = paramList.map(item => {
      if (item.concParamId === values.concParamId) {
        return { ...item, ...values };
      }
      return item;
    });
    dispatch({
      type: 'concurrent/updateState',
      payload: { concurrentDetail: { paramList: newList, ...otherValues } },
    });
    this.setState({ drawerVisible: false, targetItem: {} });
  }

  /**
   * 滑窗取消操作
   */
  @Bind()
  handleCancelOption() {
    this.setState({
      drawerVisible: false,
      targetItem: {},
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      fetchDetail,
      creating,
      updating,
      match,
      concurrent: {
        concurrentDetail = {},
        paramsType = [],
        paramFormatList = [],
        editTypeList = [],
      },
    } = this.props;
    const { targetItem = {}, drawerVisible = false, disabled = false } = this.state;
    const headerTitle =
      match.params.id === 'create'
        ? intl.get('hsdr.concurrent.view.message.title.add').d('请求定义 - 新增')
        : intl.get('hsdr.concurrent.view.message.title.edit').d('请求定义 - 编辑');
    const title = targetItem.concParamId
      ? intl.get('hsdr.concurrent.view.message.drawer.edit').d('编辑参数')
      : intl.get('hsdr.concurrent.view.message.drawer.add').d('新增参数');
    const { getFieldDecorator } = form;
    const listProps = {
      paramsType,
      loading: fetchDetail,
      dataSource: concurrentDetail.paramList,
      editContent: this.handleEditContent,
      deleteContent: this.handleDeleteContent,
    };
    const drawerProps = {
      title,
      paramsType,
      paramFormatList,
      editTypeList,
      anchor: 'right',
      visible: drawerVisible,
      itemData: targetItem,
      onOk: this.handleSaveContent,
      onCancel: this.handleCancelOption,
      onEditOk: this.handleEditOk,
    };
    return (
      <React.Fragment>
        <Header title={headerTitle} backPath="/hsdr/concurrent/list">
          <Button
            type="primary"
            icon="save"
            loading={creating || updating}
            onClick={this.handleSave}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="plus" onClick={this.handleAddLine}>
            {intl.get('hsdr.concurrent.view.option.addParam').d('新增参数')}
          </Button>
        </Header>
        <Content>
          <Form className={classNames(styles['header-form'])}>
            <Row gutter={24} type="flex">
              <Col span={12}>
                <Form.Item
                  label={intl.get('hsdr.concurrent.model.concurrent.concCode').d('请求编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('concCode', {
                    initialValue: concurrentDetail.concCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hsdr.concurrent.model.concurrent.concCode').d('请求编码'),
                        }),
                      },
                    ],
                  })(
                    <Input
                      disabled={!!concurrentDetail.concurrentId}
                      typeCase="upper"
                      trim
                      inputChinese={false}
                    />
                  )}
                </Form.Item>
                <Form.Item
                  label={intl.get('hsdr.concurrent.model.concurrent.concDescription').d('请求描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('concDescription', {
                    initialValue: concurrentDetail.concDescription,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hsdr.concurrent.model.concurrent.concDescription')
                            .d('请求描述'),
                        }),
                      },
                    ],
                  })(<Input disabled={disabled} />)}
                </Form.Item>
                <Form.Item
                  label={intl.get('hsdr.concurrent.model.concurrent.alarmEmail').d('报警邮箱')}
                  {...formLayout}
                >
                  {getFieldDecorator('alarmEmail', {
                    initialValue: concurrentDetail.alarmEmail,
                    rules: [
                      {
                        pattern: EMAIL,
                        message: intl
                          .get('hsdr.concurrent.view.validation.alarmEmail')
                          .d('格式有误'),
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={intl.get('hsdr.concurrent.model.concurrent.concName').d('请求名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('concName', {
                    initialValue: concurrentDetail.concName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hsdr.concurrent.model.concurrent.concName').d('请求名称'),
                        }),
                      },
                    ],
                  })(<Input disabled={disabled} />)}
                </Form.Item>
                <Form.Item
                  label={intl
                    .get('hsdr.concurrent.model.concurrent.executableName')
                    .d('可执行名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('executableId', {
                    initialValue: concurrentDetail.executableId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hsdr.concurrent.model.concurrent.executableName')
                            .d('可执行名称'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      disabled={!!concurrentDetail.concurrentId}
                      textValue={concurrentDetail.executableName}
                      code="HSDR.EXECUTABLE"
                    />
                  )}
                </Form.Item>
                <Form.Item label={intl.get('hzero.common.status').d('状态')} {...formLayout}>
                  {getFieldDecorator('enabledFlag', {
                    initialValue:
                      concurrentDetail.enabledFlag === undefined ? 1 : concurrentDetail.enabledFlag,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Tabs defaultActiveKey="rule">
            <Tabs.TabPane tab={intl.get('hsdr.concurrent.view.tab.param').d('参数')} key="rule">
              <ListTable {...listProps} />
            </Tabs.TabPane>
          </Tabs>
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
