/**
 * Currency - 币种定义列表页
 * @date: 2018-7-3
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Form, Input, Button, Modal, InputNumber, Table } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';

import TLEditor from 'components/TLEditor';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import cacheComponent from 'components/CacheComponent';
import OptionInput from 'components/OptionInput';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';

import Detail from './Detail';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
/**
 * modal的侧滑属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

/**
 * 引用明细弹框
 * @extends {Component} - React.Component
 * @reactProps {Object} detailVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} handleDetail - 控制modal显示隐藏方法
 * @return React.element
 */
const DetailModal = props => {
  const { detailVisible, handleDetail } = props;

  return (
    <Modal
      title={intl.get('hpfm.currency.view.message.title.detail.modal').d('币种明细')}
      visible={detailVisible}
      onCancel={() => {
        handleDetail(false);
      }}
      width={1000}
      footer={null}
    >
      <Detail />
    </Modal>
  );
};

/**
 * 币种编辑弹出框
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} editRowData - 当前编辑数据
 * @reactProps {Object} modalVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} handleAdd - 数据保存
 * @reactProps {Function} showEditModal - 控制modal显示隐藏方法
 * @return React.element
 */
const CreateForm = Form.create({ fieldNameProp: null })(props => {
  const { form, modalVisible, handleAdd, showEditModal, editRowData, loading } = props;
  const {
    currencyCode,
    currencyName,
    countryId,
    financialPrecision,
    defaultPrecision,
    currencySymbol,
    enabledFlag,
    countryName,
    _token,
  } = editRowData;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue, form);
    });
  };
  const cancelHandle = () => {
    showEditModal(false);
  };
  return (
    <Modal
      confirmLoading={loading}
      title={intl.get('hpfm.currency.view.message.title.list.modal').d('新建币种')}
      visible={modalVisible}
      onOk={okHandle}
      destroyOnClose
      width={500}
      onCancel={() => cancelHandle()}
      {...otherProps}
    >
      <React.Fragment>
        <FormItem
          label={intl.get('hpfm.currency.model.currency.currencyCode').d('币种代码')}
          {...formLayout}
        >
          {form.getFieldDecorator('currencyCode', {
            initialValue: currencyCode,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.currency.model.currency.currencyCode').d('币种代码'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input typeCase="upper" inputChinese={false} disabled={!!currencyCode} />)}
        </FormItem>
        <FormItem
          label={intl.get('hpfm.currency.model.currency.currencyName').d('币种名称')}
          {...formLayout}
        >
          {form.getFieldDecorator('currencyName', {
            initialValue: currencyName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.currency.model.currency.currencyName').d('币种名称'),
                }),
              },
              {
                max: 40,
                message: intl.get('hzero.common.validation.max', {
                  max: 40,
                }),
              },
            ],
          })(
            <TLEditor
              label={intl.get('hpfm.currency.model.currency.currencyName').d('币种名称')}
              field="currencyName"
              token={_token}
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('hpfm.currency.model.currency.countryName').d('国家/地区')}
          {...formLayout}
        >
          {form.getFieldDecorator('countryId', {
            initialValue: countryId,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.currency.model.currency.countryName').d('国家/地区'),
                }),
              },
            ],
          })(<Lov textValue={countryName} code="HPFM.COUNTRY" queryParams={{ enabledFlag: 1 }} />)}
        </FormItem>
        <FormItem
          label={intl.get('hpfm.currency.model.currency.financialPrecision').d('财务精度')}
          {...formLayout}
        >
          {form.getFieldDecorator('financialPrecision', {
            initialValue: financialPrecision,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.currency.model.currency.financialPrecision').d('财务精度'),
                }),
              },
            ],
          })(<InputNumber min={0} maxLength={8} style={{ width: '100%' }} />)}
        </FormItem>
        <FormItem
          label={intl.get('hpfm.currency.model.currency.defaultPrecision').d('精度')}
          {...formLayout}
        >
          {form.getFieldDecorator('defaultPrecision', {
            initialValue: defaultPrecision,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.currency.model.currency.defaultPrecision').d('精度'),
                }),
              },
            ],
          })(<InputNumber min={0} maxLength={8} style={{ width: '100%' }} />)}
        </FormItem>
        <FormItem
          label={intl.get('hpfm.currency.model.currency.currencySymbol').d('货币符号')}
          {...formLayout}
        >
          {form.getFieldDecorator('currencySymbol', {
            initialValue: currencySymbol,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.currency.model.currency.currencySymbol').d('货币符号'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
          {form.getFieldDecorator('enabledFlag', {
            initialValue: enabledFlag === undefined ? 1 : enabledFlag,
          })(<Switch />)}
        </FormItem>
      </React.Fragment>
    </Modal>
  );
});

/**
 * 币种定义
 * @extends {Component} - React.Component
 * @reactProps {Object} currency - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hpfm.currency'] })
@connect(({ currency, loading }) => ({
  currency,
  tenantId: getCurrentOrganizationId(),
  fetchLoading: loading.effects['currency/fetchCurrencyList'],
  updateLoading: loading.effects['currency/updateCurrency'],
  addLoading: loading.effects['currency/addCurrency'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
@cacheComponent({ cacheKey: '/hpfm/mdm/Currency' })
export default class CurrencyList extends PureComponent {
  /**
   * 内部状态
   */
  state = {
    modalVisible: false,
    editRowData: {},
    detailVisible: false,
  };

  /**
   * 控制弹出框显示隐藏
   * @param {boolean} flag 显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  showEditModal(flag, record) {
    this.setState({
      modalVisible: !!flag,
      editRowData: record || {},
    });
    if (!flag) {
      this.setState({
        editRowData: {},
      });
    }
  }

  /**
   * 新增币种定义
   * @param {Object} fieldsValue 传递的filedvalue
   * @param {Object} form 表单
   */
  @Bind()
  handleAdd(fieldsValue) {
    const { dispatch, tenantId } = this.props;
    const { editRowData } = this.state;
    if (editRowData.currencyId) {
      dispatch({
        type: 'currency/updateCurrency',
        payload: {
          tenantId,
          ...editRowData,
          ...fieldsValue,
          currencyCode: lodash.trim(fieldsValue.currencyCode),
        },
      }).then(response => {
        if (response) {
          notification.success();
          this.showEditModal(false);
          this.refresh();
        }
      });
    } else {
      dispatch({
        type: 'currency/addCurrency',
        payload: {
          tenantId,
          ...editRowData,
          ...fieldsValue,
          currencyCode: lodash.trim(fieldsValue.currencyCode),
        },
      }).then(response => {
        if (response) {
          notification.success();
          this.showEditModal(false);
          this.refresh();
        }
      });
    }
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchData(pageData = {}) {
    const { form, dispatch, tenantId } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'currency/fetchCurrencyList',
          payload: {
            tenantId,
            ...fieldsValue.option,
            countryName: fieldsValue.countryName,
            page: pageData,
          },
        });
      }
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  queryValue() {
    const data = {
      page: 0,
    };
    this.fetchData(data);
  }

  /**
   * 控制明细弹框的显示隐藏，并且查询明细数据
   * @param {boolean} flag  显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  handleDetail(flag, record) {
    const { dispatch, tenantId } = this.props;
    this.setState({
      detailVisible: flag,
    });
    if (flag) {
      dispatch({
        type: 'currency/fetchDetail',
        payload: {
          tenantId,
          currencyId: record.currencyId,
          page: 0,
          size: 10,
        },
      });
    }
  }

  /**
   * 刷新数据
   */
  @Bind()
  refresh() {
    const {
      currency: { data = {} },
    } = this.props;
    this.fetchData(data.pagination);
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    this.fetchData({});
  }

  /**
   * 分页切换事件
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchData(pagination);
  }

  /**
   * 表单重置
   */
  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
  };

  /**
   * 渲染查询结构
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const queryArray = [
      {
        queryLabel: intl.get('hpfm.currency.model.currency.currencyCode').d('币种代码'),
        queryName: 'currencyCode',
        inputProps: {
          typeCase: 'upper',
          trim: true,
          inputChinese: false,
        },
      },
      {
        queryLabel: intl.get('hpfm.currency.model.currency.currencyName').d('币种名称'),
        queryName: 'currencyName',
      },
    ];
    return (
      <Form layout="inline">
        <FormItem>{getFieldDecorator('option')(<OptionInput queryArray={queryArray} />)}</FormItem>
        <FormItem label={intl.get('hpfm.currency.model.currency.countryName').d('国家/地区')}>
          {getFieldDecorator('countryName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      currency: { data = {} },
      fetchLoading,
      updateLoading,
      addLoading,
    } = this.props;
    const { modalVisible, editRowData, detailVisible } = this.state;
    const columns = [
      {
        title: intl.get('hpfm.currency.model.currency.currencyCode').d('币种代码'),
        dataIndex: 'currencyCode',
        width: 200,
      },
      {
        title: intl.get('hpfm.currency.model.currency.currencyName').d('币种名称'),
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('hpfm.currency.model.currency.countryName').d('国家/地区'),
        dataIndex: 'countryName',
        width: 200,
      },
      {
        title: intl.get('hpfm.currency.model.currency.financialPrecision').d('财务精度'),
        dataIndex: 'financialPrecision',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get('hpfm.currency.model.currency.defaultPrecision').d('精度'),
        dataIndex: 'defaultPrecision',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get('hpfm.currency.model.currency.currencySymbol').d('货币符号'),
        dataIndex: 'currencySymbol',
        width: 90,
        align: 'right',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        render: enableRender,
        width: 80,
        align: 'center',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        align: 'center',
        render: (_, record) => (
          <Fragment>
            <a
              onClick={() => {
                this.showEditModal(true, record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </Fragment>
        ),
      },
    ];

    const parentMethods = {
      handleAdd: this.handleAdd,
      showEditModal: this.showEditModal,
    };

    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.currency.view.message.title.list').d('币种定义')}>
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          <Table
            bordered
            loading={fetchLoading}
            rowKey="currencyId"
            dataSource={data.list}
            columns={columns}
            pagination={data.pagination}
            onChange={this.handleStandardTableChange}
          />
          <CreateForm
            loading={updateLoading || addLoading}
            modalVisible={modalVisible}
            editRowData={editRowData}
            {...parentMethods}
          />
          <DetailModal handleDetail={this.handleDetail} detailVisible={detailVisible} />
        </Content>
      </React.Fragment>
    );
  }
}
