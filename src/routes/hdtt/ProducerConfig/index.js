/**
 * producerConfig - 数据消息配置
 * @date: 2018-8-8
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { routerRedux } from 'dva/router';
import { Form, Button, Table, Input, DatePicker, Badge } from 'hzero-ui';
import { random } from 'lodash';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';
import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';

import notification from 'utils/notification';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { enableRender, dateRender } from 'utils/renderer';
import { getDateFormat, tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './index.less';

const FormItem = Form.Item;
const promptCode = 'hdtt.producerConfig';
/**
 * 数据消息配置
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} ProducerConfig - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ producerConfig, loading }) => ({
  producerConfig,
  loading: loading.effects['producerConfig/init'],
  saving: loading.effects['producerConfig/saveProducer'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: 'hdtt.producerConfig' })
@CacheComponent({ cacheKey: '/hdtt/producerConfig' })
export default class ProducerConfig extends PureComponent {
  state = {
    fieldsValues: {},
    paging: { page: 0, size: 10 },
  };

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
    } = this.props;
    if (_back === -1) {
      this.loadData(this.state.paging);
    } else {
      this.loadData();
    }
  }

  /**
   * 按条件查询
   */
  loadData = payload => {
    const { dispatch } = this.props;
    const { fieldsValues, paging } = this.state;
    dispatch({
      type: 'producerConfig/init',
      payload: { ...fieldsValues, ...paging, ...payload },
    });
  };

  /**
   * 模糊查询税率
   */
  handSearch = e => {
    const { form } = this.props;
    e.preventDefault();
    form.validateFields((err, fieldsValues) => {
      if (!err) {
        this.setState({ fieldsValues }, () => {
          this.loadData({ page: 0, size: 10 });
        });
      }
    });
  };

  /**
   * 重置表单
   */
  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({ fieldsValues: '' });
  };

  @Bind()
  handleTableChange(pagination) {
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
    };
    this.setState({ paging: params }, () => {
      this.loadData();
    });
  }

  /**
   * 跳转路由到消息配置
   */
  handleGotoConfig = record => {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hdtt/producer-config/allocation/${record.producerConfigId}/${record.tableName}`,
      })
    );
  };

  /**
   *移除对象中的某个属性
   *
   * @param {*} obj 传入的对象
   * @param {*} paramsArr 对象里的key
   * @returns
   * @memberof ProducerConfig
   */
  handleRemoveProps(obj, paramsArr) {
    const newItem = { ...obj };
    paramsArr.forEach(item => {
      if (newItem[item]) {
        delete newItem[item];
      }
    });
    return newItem;
  }

  /**
   *新建行
   *
   * @returns
   * @memberof ProducerConfig
   */
  @Bind()
  handleCreate() {
    const {
      dispatch,
      producerConfig: { producerList, pagination },
    } = this.props;
    dispatch({
      type: 'producerConfig/updateState',
      payload: {
        producerList: [
          {
            isNew: true,
            tableName: '',
            tenantFlag: 1,
            // startDate: moment(new Date()),
            // endDate: moment(new Date()),
            enabledFlag: 1,
            producerConfigId: `${moment(new Date()).format(DEFAULT_DATETIME_FORMAT)} ${random(
              0,
              1000
            )}`,
          },
          ...producerList,
        ],
        pagination: {
          ...pagination,
          pageSize: pagination.pageSize + 1,
          total: pagination.total + 1,
        },
      },
    });
  }

  /**
   *删除新建的行
   *
   * @param {*} record
   * @memberof ProducerConfig
   */
  @Bind()
  handleDelete(record) {
    const {
      dispatch,
      producerConfig: { producerList, pagination },
    } = this.props;
    const newProducerList = producerList.filter(
      item => item.producerConfigId !== record.producerConfigId
    );
    dispatch({
      type: 'producerConfig/updateState',
      payload: {
        producerList: newProducerList,
        pagination: {
          ...pagination,
          pageSize: pagination.pageSize - 1,
          total: pagination.total - 1,
        },
      },
    });
  }

  /**
   *编辑行
   *
   * @param {*} record
   * @memberof ProducerConfig
   */
  @Bind()
  editRow(record) {
    const {
      producerConfig: { producerList },
      dispatch,
    } = this.props;
    const newProducerList = producerList.map(item => {
      if (record.producerConfigId === item.producerConfigId) {
        return { ...item, isEdit: true };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'producerConfig/updateState',
      payload: { producerList: newProducerList },
    });
  }

  /**
   *取消编辑行
   *
   * @param {*} record 行数据
   * @memberof ProducerConfig
   */
  @Bind()
  handleCancel(record) {
    const {
      dispatch,
      producerConfig: { producerList },
    } = this.props;
    const newProducerList = producerList.map(item => {
      if (item.producerConfigId === record.producerConfigId) {
        return { ...item, isEdit: false };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'producerConfig/updateState',
      payload: { producerList: newProducerList },
    });
  }

  /**
   *保存编辑或者新建的数据
   *
   * @memberof LibraryPosition
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      producerConfig: { producerList },
      form,
    } = this.props;
    form.validateFields(err => {
      if (!err) {
        const newSaveDataList = producerList.filter(item => item.isNew || item.isEdit);
        // const EditDataList = producerList.filter(item => item.isEdit);
        const fieldsArr = [
          'tableName',
          'description',
          'tenantFlag',
          'startDate',
          'endDate',
          'enabledFlag',
        ];
        const values = form.getFieldsValue();
        let payloadData = [];
        const tempList = newSaveDataList.map(item => {
          let targetItem = { ...item };
          fieldsArr.forEach(_item => {
            targetItem[`${_item}`] = values[`${_item}#${item.producerConfigId}`];
          });
          if (targetItem.isNew) {
            targetItem = this.handleRemoveProps(targetItem, ['producerConfigId', 'isNew']);
          } else if (targetItem.isEdit) {
            targetItem = this.handleRemoveProps(targetItem, ['isEdit']);
          }
          return targetItem;
        });
        payloadData = tempList.map(item => {
          if (item.startDate || item.endDate) {
            return {
              ...item,
              startDate: item.startDate
                ? item.startDate.format(DEFAULT_DATE_FORMAT)
                : item.startDate,
              endDate: item.endDate ? item.endDate.format(DEFAULT_DATE_FORMAT) : item.endDate,
            };
          } else {
            const { startDate, endDate, ...otherItem } = item;
            return otherItem;
          }
        });
        dispatch({
          type: 'producerConfig/saveProducer',
          payload: { payloadData },
        }).then(res => {
          if (res) {
            notification.success();
            this.loadData();
          }
        });
      }
    });
  }

  renderForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem label={intl.get(`${promptCode}.model.producerConfig.tableName`).d('生产表名')}>
          {getFieldDecorator('tableName')(<Input typeCase="lower" />)}
        </FormItem>
        <FormItem label={intl.get(`${promptCode}.view.message.lov.consumerService`).d('服务名称')}>
          {getFieldDecorator('consumerService')(
            <Lov
              code="HDTT.SERVICE"
              style={{ width: 150 }}
              textField="consumerService"
              // queryParams={}
            />
          )}
        </FormItem>
        <FormItem label={intl.get(`${promptCode}.view.message.lov.tenantId`).d('租户名称')}>
          {getFieldDecorator('tenantId')(
            <Lov
              code="HPFM.TENANT"
              style={{ width: 150 }}
              textField="tenantName"
              // queryParams={}
            />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.handSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const {
      producerConfig: { pagination, producerList },
      loading,
      saving,
      form,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const isSaveList = producerList.filter(item => {
      return item.isNew || item.isEdit;
    });
    const columns = [
      {
        title: intl.get(`${promptCode}.model.producerConfig.tableName`).d('生产表名'),
        width: 150,
        dataIndex: 'tableName',
        render: (text, record) =>
          record.isEdit || record.isNew ? (
            <FormItem>
              {getFieldDecorator(`tableName#${record.producerConfigId}`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.producerConfig.tableName`).d('生产表名'),
                    }),
                  },
                ],
                initialValue: record.tableName,
              })(
                <Input
                  trim
                  typeCase="lower"
                  inputChinese={false}
                  disabled={record.isEdit}
                  style={{ width: 150 }}
                />
              )}
            </FormItem>
          ) : (
            text
          ),
      },
      {
        title: intl.get(`${promptCode}.model.producerConfig.description`).d('说明'),
        dataIndex: 'description',
        render: (text, record) =>
          record.isEdit || record.isNew ? (
            <FormItem>
              {getFieldDecorator(`description#${record.producerConfigId}`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.producerConfig.description`).d('说明'),
                    }),
                  },
                ],
                initialValue: record.description,
              })(<Input />)}
            </FormItem>
          ) : (
            text
          ),
      },
      {
        title: intl.get(`${promptCode}.model.producerConfig.tenantFlag`).d('是否按照租户分发'),
        width: 150,
        dataIndex: 'tenantFlag',
        render: (text, record) =>
          record.isEdit || record.isNew ? (
            <FormItem>
              {getFieldDecorator(`tenantFlag#${record.producerConfigId}`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.producerConfig.tenantFlag`)
                        .d('是否按照租户分发'),
                    }),
                  },
                ],
                initialValue: record.tenantFlag,
              })(<Checkbox />)}
            </FormItem>
          ) : text === 1 ? (
            <Badge status="success" text={intl.get('hzero.common.status.yes').d('是')} />
          ) : (
            <Badge status="error" text={intl.get('hzero.common.status.no').d('否')} />
          ),
      },
      {
        title: intl.get(`${promptCode}.model.producerConfig.startDate`).d('生效日期从'),
        dataIndex: 'startDate',
        width: 150,
        render: (text, record) =>
          record.isEdit || record.isNew ? (
            <FormItem>
              {getFieldDecorator(`startDate#${record.producerConfigId}`, {
                initialValue: record.startDate ? moment(record.startDate, getDateFormat()) : null,
              })(
                <DatePicker
                  format={getDateFormat()}
                  disabledDate={currentDate =>
                    getFieldValue(`endDate#${record.producerConfigId}`) &&
                    moment(getFieldValue(`endDate#${record.producerConfigId}`)).isBefore(
                      currentDate,
                      'day'
                    )
                  }
                />
              )}
            </FormItem>
          ) : (
            dateRender(text)
          ),
      },
      {
        title: intl.get(`${promptCode}.model.producerConfig.endDate`).d('生效日期到'),
        dataIndex: 'endDate',
        width: 150,
        render: (text, record) =>
          record.isEdit || record.isNew ? (
            <FormItem>
              {getFieldDecorator(`endDate#${record.producerConfigId}`, {
                initialValue: record.endDate ? moment(record.endDate, getDateFormat()) : null,
              })(
                <DatePicker
                  format={getDateFormat()}
                  disabledDate={currentDate =>
                    getFieldValue(`startDate#${record.producerConfigId}`) &&
                    moment(getFieldValue(`startDate#${record.producerConfigId}`)).isAfter(
                      currentDate,
                      'day'
                    )
                  }
                />
              )}
            </FormItem>
          ) : (
            dateRender(text)
          ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: (text, record) =>
          record.isEdit || record.isNew ? (
            <FormItem>
              {getFieldDecorator(`enabledFlag#${record.producerConfigId}`, {
                initialValue: record.enabledFlag ? 1 : 0,
              })(<Checkbox />)}
            </FormItem>
          ) : (
            enableRender(text)
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        key: 'edit',
        render: (text, record) => (
          <React.Fragment>
            {record.isEdit && (
              <a onClick={() => this.handleCancel(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record.isNew && (
              <a onClick={() => this.handleDelete(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            )}
            {!record.isNew && !record.isEdit && (
              <React.Fragment>
                <a onClick={() => this.handleGotoConfig(record)}>
                  {intl.get(`${promptCode}.view.message.table.consumptionAllocation`).d('消费配置')}
                </a>
                <a onClick={() => this.editRow(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              </React.Fragment>
            )}
          </React.Fragment>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title`).d('数据消息生产消费配置')}>
          <Button icon="plus" type="primary" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {isSaveList.length > 0 && (
            <Button icon="save" loading={saving} onClick={this.handleSave}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          <Table
            bordered
            rowKey="producerConfigId"
            loading={loading}
            className={classnames(styles.table)}
            dataSource={producerList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            onChange={this.handleTableChange}
          />
        </Content>
      </React.Fragment>
    );
  }
}
