/**
 * Rate - 汇率定义-平台级
 * @date: 2018-7-15
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Table } from 'hzero-ui';
import { divide, round, multiply } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { Content, Header } from 'components/Page';
import OptionInput from 'components/OptionInput';

import { getDateFormat } from 'utils/utils';
import notification from 'utils/notification';
import { DATETIME_MIN } from 'utils/constants';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import RateForm from './RateForm';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
@connect(({ loading, rate }) => ({
  rate,
  createLoading: loading.effects['rate/createRate'],
  updateLoading: loading.effects['rate/updateRate'],
  initLoading: loading.effects['rate/fetchRateData'],
}))
@formatterCollections({ code: 'hpfm.rate' })
export default class Rate extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rateFormData: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'rate/init' });
    this.fetchRateData();
  }

  /**
   * @function fetchRateData - 查询汇率列表数据
   * @param {object} params - 查询参数
   */
  fetchRateData(params = {}) {
    const {
      dispatch,
      form,
      rate: { pagination = {} },
    } = this.props;
    const { forCurrency, toCurrency } = form.getFieldsValue();
    dispatch({
      type: 'rate/fetchRateData',
      payload: { ...forCurrency, ...toCurrency, page: pagination, ...params },
    });
  }

  /**
   * @function handleModalVisible - 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    if (flag === false && this.RateForm) {
      this.RateForm.resetForm();
    }
    dispatch({
      type: 'rate/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  /**
   * @function showModal - 新建显示模态框
   */
  @Bind()
  showModal() {
    this.setState({
      rateFormData: {},
    });
    this.handleModalVisible(true);
  }

  /**
   * @function hideModal - 隐藏模态框
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  /**
   * @function handleSearchRate - 搜索表单
   */
  @Bind()
  handleSearchRate() {
    this.fetchRateData({ page: {} });
  }

  /**
   * @function handleResetSearch - 重置查询表单
   */
  @Bind()
  handleResetSearch() {
    this.props.form.resetFields();
  }

  /**
   * @function handleStandardTableChange - 分页操作
   * @param {object} pagination - 分页数据对象
   */
  @Bind()
  handleStandardTableChange(pagination) {
    this.fetchRateData({
      page: pagination,
    });
  }

  /**
   * @function handleUpdateRate - 更新显示模态框
   * @param {object} record - 更新的数据
   */
  @Bind()
  handleUpdateRate(record) {
    this.setState({
      rateFormData: record,
    });
    this.handleModalVisible(true);
  }

  /**
   * @function handleAdd - 更新汇率定义
   * @param {object} record - 更新的数据
   */
  @Bind()
  handleAdd(fieldsValue) {
    const { dispatch } = this.props;
    const { rateFormData } = this.state;
    const params = {
      ...rateFormData,
      ...fieldsValue,
      enabledFlag: fieldsValue.enabledFlag ? 1 : 0,
      startDate: moment(fieldsValue.startDate).format(DATETIME_MIN),
      endDate: moment(fieldsValue.endDate).format(DATETIME_MIN),
      rate: round(divide(fieldsValue.exchangeNumber, fieldsValue.currencyNumber), 4),
    };
    dispatch({
      type: `rate/${rateFormData.exchangeRateId ? 'updateRate' : 'createRate'}`,
      payload: params,
    }).then(response => {
      if (Array.isArray(response) && response.length > 0) {
        notification.warning({
          message: intl
            .get('hpfm.rate.view.validation.repeatData')
            .d(`所选日期区间存在重复数据：${response.join('、')}`),
        });
      } else {
        // eslint-disable-next-line
        if (response) {
          notification.success();
          this.hideModal();
          this.fetchRateData();
        }
      }
    });
  }

  renderFilterForm() {
    const { getFieldDecorator } = this.props.form;
    const fromCurrencyArray = [
      {
        queryLabel: intl.get('hpfm.rate.model.rate.fromCurrencyCode').d('币种代码'),
        queryName: 'fromCurrencyCode',
      },
      {
        queryLabel: intl.get('hpfm.rate.model.rate.fromCurrencyName').d('币种名称'),
        queryName: 'fromCurrencyName',
      },
    ];
    const toCurrencyArray = [
      {
        queryLabel: intl.get('hpfm.rate.model.rate.toCurrencyCode').d('兑换币种代码'),
        queryName: 'toCurrencyCode',
      },
      {
        queryLabel: intl.get('hpfm.rate.model.rate.toCurrencyName').d('兑换币种名称'),
        queryName: 'toCurrencyName',
      },
    ];
    return (
      <Form layout="inline">
        <Form.Item>
          {getFieldDecorator('forCurrency')(<OptionInput queryArray={fromCurrencyArray} />)}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('toCurrency')(<OptionInput queryArray={toCurrencyArray} />)}
        </Form.Item>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.handleSearchRate}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleResetSearch}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const {
      initLoading,
      updateLoading,
      createLoading,
      rate: { rateList = [], modalVisible, rateMethodList, pagination = {} },
    } = this.props;
    const { rateFormData } = this.state;
    const title = rateFormData.exchangeRateId
      ? intl.get('hpfm.rate.view.message.edit').d('编辑汇率定义')
      : intl.get('hpfm.rate.view.message.create').d('新建汇率定义');
    const rateFormProps = {
      title,
      rateMethodList,
      modalVisible,
      anchor: 'right',
      confirmLoading: updateLoading || createLoading,
      onCancel: this.hideModal,
      onHandleAdd: this.handleAdd,
      initData: rateFormData,
    };
    const columns = [
      {
        title: intl.get('hpfm.rate.model.rate.fromCurrencyCode').d('币种代码'),
        width: 120,
        dataIndex: 'fromCurrencyCode',
      },
      {
        title: intl.get('hpfm.rate.model.rate.fromCurrencyName').d('币种名称'),
        dataIndex: 'fromCurrencyName',
        minWidth: 200,
      },
      {
        title: intl.get('hpfm.rate.model.rate.toCurrencyCode').d('兑换币种代码'),
        width: 120,
        dataIndex: 'toCurrencyCode',
      },
      {
        title: intl.get('hpfm.rate.model.rate.toCurrencyName').d('兑换币种名称'),
        dataIndex: 'toCurrencyName',
        minWidth: 200,
      },
      {
        title: intl.get('hpfm.rate.model.rate.rateTypeName').d('汇率类型'),
        key: 'rateTypeName',
        align: 'center',
        width: 100,
        dataIndex: 'rateTypeName',
      },
      {
        title: intl.get('hpfm.rate.model.rate.rateDate').d('兑换日期'),
        align: 'center',
        width: 150,
        dataIndex: 'rateDate',
        render: text => {
          return <span>{moment(text).format(getDateFormat())}</span>;
        },
      },
      {
        title: intl.get('hpfm.rate.model.rate.currencyNumber').d('货币数量'),
        align: 'right',
        width: 100,
        dataIndex: 'currencyNumber',
        render: () => {
          return <span>1</span>;
        },
      },
      {
        title: intl.get('hpfm.rate.model.rate.exchangeNumber').d('兑换数量'),
        align: 'right',
        width: 100,
        dataIndex: 'exchangeNumber',
        render: (text, record) => {
          return <span>{round(multiply(1, record.rate), 8)}</span>;
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        align: 'center',
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 100,
        fixed: 'right',
        render: (text, record) => {
          return (
            <a onClick={() => this.handleUpdateRate(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.rate.view.message.title').d('汇率定义')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderFilterForm()}</div>
          <Table
            bordered
            scroll={{ x: 1300 }}
            rowKey="exchangeRateId"
            loading={initLoading}
            dataSource={rateList}
            columns={columns}
            pagination={pagination}
            onChange={this.handleStandardTableChange}
          />
          <RateForm {...rateFormProps} />
        </Content>
      </React.Fragment>
    );
  }
}
