/**
 * Detail - 熔断设置详情页
 * @date: 2018-9-15
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, hand
 */
import React, { Component } from 'react';
import { Button, Form, Col, Row, Input, Modal, Table, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import Switch from 'components/Switch';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

import DetailFilter from './DetailFilter';
import DetailDrawer from './DetailDrawer';

const promptCode = 'hcnf.hystrix';
/**
 *熔断详情设置
 * @extends {Component} - React.Component
 * @reactProps {object}
 */
@connect(({ hystrix, loading }) => ({
  fetchHeaderInformationLoading: loading.effects['hystrix/fetchHeaderInformation'],
  fetchDetailListLoading: loading.effects['hystrix/fetchDetailList'],
  addLoading: loading.effects['hystrix/add'],
  refreshLoading: loading.effects['hystrix/refresh'],
  hystrix,
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hcnf.hystrix'] })
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      conf: {},
      serviceName: '',
      selectedRows: [],
      oldHeaderInformation: {},
      modalVisible: false,
    };
  }

  componentDidMount() {
    const { match, dispatch } = this.props;
    const { confId } = match.params;
    this.handleSearch({ confId });
    this.getHeaderInformation();
    dispatch({
      type: 'hystrix/updateState',
      payload: {
        detailList: [],
        headerInformation: {},
      },
    });
  }

  /**
   * 获取头信息
   */
  @Bind()
  getHeaderInformation() {
    const { dispatch, match } = this.props;
    const { confId } = match.params;
    dispatch({
      type: 'hystrix/fetchHeaderInformation',
      payload: { confId },
    })
      .then(res => {
        if (res) {
          const {
            hystrix: { headerInformation },
          } = this.props;
          dispatch({
            type: 'hystrix/fetchProperNameList',
            payload: {
              lovCode: 'HPFM.HYSTRIX_CONF_PROPS',
              parentValue: headerInformation.confKey,
            },
          });
          this.setState({
            serviceName: headerInformation.serviceName,
            oldHeaderInformation: headerInformation,
          });
        }
      })
      .then(res => {
        if (res) {
          dispatch({
            type: 'hystrix/fetchConfTypeCodeList',
            payload: { lovCode: 'HSGP.HYSTRIX_CONF_TYPE' },
          });
        }
      });
  }

  /**
   * 搜索细则
   * @param {object} fields
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, match } = this.props;
    const { confId } = match.params;
    dispatch({
      type: 'hystrix/fetchDetailList',
      payload: { ...fields, confId },
    });
  }

  /**
   * 批量删除细则
   */
  @Bind()
  handleDeleteDetails() {
    const { dispatch, match } = this.props;
    const { selectedRows } = this.state;
    const { confId } = match.params;
    if (selectedRows.length > 0) {
      const onOk = () => {
        dispatch({
          type: 'hystrix/deleteDetails',
          payload: selectedRows,
        }).then(res => {
          if (res) {
            notification.success();
            this.handleSearch({ confId });
            this.setState({ selectedRows: [] });
          }
        });
      };
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.remove`).d('确定删除选中数据？'),
        onOk,
      });
    } else {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 新增细则
   */
  @Bind()
  addDetails(fields) {
    const {
      dispatch,
      hystrix: { headerInformation },
    } = this.props;
    const { confId } = headerInformation;
    const { conf } = this.state;
    const item = { ...conf, ...fields };
    this.setState({ conf: { ...conf, fields } });
    dispatch({
      type: 'hystrix/add',
      payload: { ...headerInformation, hystrixConfLines: [item] },
    }).then(res => {
      if (res) {
        this.hideModal();
        notification.success();
        this.handleSearch({ confId });
        this.getHeaderInformation();
      }
    });
  }

  /**
   * 修改当前行信息
   */
  @Bind()
  editLine(record) {
    const {
      hystrix: { propertyNameList },
    } = this.props;
    const property = propertyNameList.find(e => e.value === record.propertyName);
    const propertyRemark = property.meaning;
    this.setState({ conf: { ...record, propertyRemark }, modalVisible: true });
  }

  /**
   * 保存头信息
   */
  @Bind()
  handleSave() {
    const { dispatch, form } = this.props;
    let headerInformationChangeFlag = false; // 判断头信息是否改变，改变则为true，不变为false
    const { oldHeaderInformation } = this.state;
    const { objectVersionNumber, confKey, confId, _token } = oldHeaderInformation;
    form.validateFields((err, values) => {
      if (!err) {
        const {
          confTypeCode,
          enabledFlag,
          remark,
          serviceConfLabel,
          serviceName,
          serviceConfProfile,
        } = values;
        const newHeaderInformation = {
          confId,
          confKey,
          objectVersionNumber,
          _token,
          confTypeCode,
          enabledFlag,
          remark,
          serviceConfLabel,
          serviceName,
          serviceConfProfile,
        };
        for (const key in newHeaderInformation) {
          if (newHeaderInformation[key] !== oldHeaderInformation[key]) {
            // 当新的头与旧的头有一条字段的值不一样，就将headerInformationChangeFlag设置成true
            headerInformationChangeFlag = true;
            break;
          }
        }
        if (headerInformationChangeFlag) {
          dispatch({
            type: 'hystrix/add',
            payload: newHeaderInformation,
          }).then(res => {
            if (res && !res.failed) {
              notification.success();
              this.handleSearch();
              this.getHeaderInformation();
            }
          });
        } else {
          notification.warning({
            message: intl.get(`${promptCode}.view.message.title.noChange`).d('未修改数据'),
          });
        }
      }
    });
  }

  /**
   * 新建熔断类型展示模态框
   */
  @Bind()
  showModal() {
    this.setState({ conf: { enabledFlag: 1 }, modalVisible: true });
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.setState({ modalVisible: false });
    }
  }

  /**
   * 刷新头
   * */
  @Bind()
  handleRefreshDetail() {
    const {
      dispatch,
      hystrix: { headerInformation },
    } = this.props;
    const { confId } = headerInformation;
    dispatch({
      type: 'hystrix/refresh',
      payload: [{ confId }],
    }).then(res => {
      if (res) {
        notification.success();
        this.getHeaderInformation();
      }
    });
  }

  /**
   * 选择规则/
   * @param {array} selectedRowKeys
   * @param {array} selectedRows
   */
  @Bind()
  handleRowSelectedChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  @Bind()
  onHandleSelect(rowKey) {
    const { serviceName } = this.state;
    const {
      dispatch,
      hystrix: { headerInformation },
    } = this.props;
    if (serviceName === '' && rowKey) {
      this.props.form.setFieldsValue({ serviceName: rowKey });
      this.setState({ serviceName: rowKey });
    } else if (rowKey === null) {
      dispatch({
        type: 'hystrix/updateState',
        payload: {
          headerInformation: { ...headerInformation, serviceName: rowKey, serviceConfLabel: null },
        },
      });
      this.props.form.resetFields('serviceConfLabel', []);
      this.setState({ serviceName: '' });
    } else if (serviceName !== rowKey) {
      dispatch({
        type: 'hystrix/updateState',
        payload: {
          headerInformation: { ...headerInformation, serviceName: rowKey, serviceConfLabel: null },
        },
      });
      this.props.form.resetFields('serviceConfLabel', []);
      this.setState({ serviceName: rowKey });
    }
  }

  @Bind()
  onHandleSelectServiceConfLabel(rowKey, record) {
    const {
      dispatch,
      hystrix: { headerInformation },
    } = this.props;
    dispatch({
      type: 'hystrix/updateState',
      payload: { headerInformation: { ...headerInformation, serviceConfLabel: record.name } },
    });
    this.props.form.setFieldsValue({ serviceConfLabel: record.name });
  }

  @Bind()
  onHandleStandardTableChange(pagination) {
    const {
      hystrix: { detailQuery },
    } = this.props;
    this.handleSearch({
      page: pagination.current - 1,
      size: pagination.pageSize,
      ...detailQuery,
    });
  }

  render() {
    const {
      form,
      fetchHeaderInformationLoading,
      fetchDetailListLoading,
      addLoading,
      refreshLoading,
      form: { getFieldDecorator },
      hystrix: {
        headerInformation,
        detailList,
        detailPagination,
        propertyNameList,
        confTypeCodeList,
      },
    } = this.props;
    const basePath = '/hcnf/hystrix';
    const { serviceName, conf, selectedRows, modalVisible } = this.state;
    const nowConf = confTypeCodeList.find(e => e.value === headerInformation.confKey);
    const columns = [
      {
        title: intl.get(`${promptCode}.model.hystrix.propertyName`).d('参数代码'),
        width: 120,
        dataIndex: 'propertyName',
      },
      {
        title: intl.get(`${promptCode}.model.hystrix.propertyRemark`).d('参数描述'),
        dataIndex: 'propertyRemark',
        render: (val, record) => {
          const data = propertyNameList.find(e => {
            return e.value === record.propertyName;
          });
          if (data) {
            return data.meaning;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.hystrix.propertyValue`).d('参数值'),
        width: 200,
        dataIndex: 'propertyValue',
      },
      {
        title: intl.get(`${promptCode}.model.hystrix.remark`).d('描述'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        key: 'enabledFlag',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 60,
        render: (val, record) => (
          <a
            onClick={() => {
              this.editLine(record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.confLineId),
      onChange: this.handleRowSelectedChange,
    };
    const detailFilterProps = {
      propertyNameList,
      onFilterChange: this.handleSearch,
      showModel: this.showModel,
      addDetails: this.addDetails,
      handleDeleteDetails: this.handleDetails,
    };
    const detailDrawerProps = {
      propertyNameList,
      headerInformation,
      onOk: this.addDetails,
      onCancel: this.hideModal,
      anchor: 'right',
      data: conf,
      visible: modalVisible,
      title: conf.confLineId
        ? intl.get(`${promptCode}.view.title.editForm`).d('编辑值')
        : intl.get(`${promptCode}.view.title.createForm`).d('创建值'),
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.title.hystrix.detail`).d('熔断规则定义')}
          backPath={`${basePath}/list`}
        >
          <Button
            icon="save"
            type="primary"
            onClick={this.handleSave}
            loading={fetchHeaderInformationLoading || addLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="default"
            icon="sync"
            onClick={this.handleRefreshDetail}
            loading={refreshLoading || fetchHeaderInformationLoading}
          >
            {intl.get('hzero.common.button.refresh').d('刷新配置')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={fetchHeaderInformationLoading}>
            <Form layout="vertical" style={{ width: 900 }}>
              <Row gutter={24}>
                <Col span={6}>
                  <Form.Item label={intl.get(`${promptCode}.model.hystrix.confKey`).d('类型')}>
                    {getFieldDecorator('confType', {
                      initialValue: nowConf && nowConf.meaning,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`${promptCode}.model.hystrix.confTypeCode`).d('代码')}>
                    {getFieldDecorator('confTypeCode', {
                      initialValue: headerInformation.confTypeCode,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.hystrix.refreshTime`).d('刷新时间')}
                  >
                    {getFieldDecorator('refreshTime', {
                      initialValue: headerInformation.refreshTime,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.hystrix.refreshMessage`).d('刷新消息')}
                  >
                    {getFieldDecorator('refreshMessage', {
                      initialValue: headerInformation.refreshMessage,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={6}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.hystrix.refreshStatus`).d('刷新状态')}
                  >
                    {getFieldDecorator('refreshMessage', {
                      initialValue:
                        headerInformation.refreshStatus === 1
                          ? '刷新成功'
                          : headerInformation.refreshStatus === 0
                          ? '刷新失败'
                          : '未刷新',
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`${promptCode}.model.hystrix.remark`).d('描述')}>
                    {getFieldDecorator('remark', {
                      initialValue: headerInformation.remark,
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label={intl.get(`${promptCode}.model.hystrix.serviceName`).d('服务')}>
                    {getFieldDecorator('serviceName', {
                      initialValue: headerInformation.serviceName,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${promptCode}.model.hystrix.serviceName`).d('服务'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        textValue={headerInformation.serviceName}
                        onChange={this.onHandleSelect}
                        code="HPFM.DATASOURCE.SERVICE"
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.hystrix.serviceConfLabel`)
                      .d('服务配置标签')}
                  >
                    {getFieldDecorator('serviceConfLabel', {
                      initialValue: headerInformation.serviceConfLabel,
                    })(
                      <Lov
                        disabled={!serviceName}
                        textValue={headerInformation.serviceConfLabel}
                        code="HSGP.ZUUL.SERVICE_CONFIG"
                        onChange={this.onHandleSelectServiceConfLabel}
                        queryParams={
                          serviceName
                            ? { serviceName }
                            : { serviceName: headerInformation.serviceName }
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={6}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.hystrix.serviceConfProfile`)
                      .d('服务配置Profile')}
                  >
                    {getFieldDecorator('serviceConfProfile', {
                      initialValue: headerInformation.serviceConfProfile,
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.hystrix.enabledFlag`).d('启用状态')}
                  >
                    {form.getFieldDecorator('enabledFlag', {
                      initialValue: headerInformation.enabledFlag,
                    })(<Switch />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Spin>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="table-list-operator" style={{ marginTop: '10' }}>
              <Button icon="plus" onClick={this.showModal}>
                {intl.get('hzero.common.button.add').d('新建')}
              </Button>
              <Button icon="delete" onClick={this.handleDeleteDetails} style={{ marginLeft: 8 }}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </div>
            <div className="table-list-search">
              <DetailFilter {...detailFilterProps} />
            </div>
          </div>
          <Table
            bordered
            rowSelection={rowSelection}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            loading={fetchDetailListLoading}
            dataSource={detailList}
            rowKey="confLineId"
            pagination={detailPagination}
            onChange={this.onHandleStandardTableChange}
          />
          <DetailDrawer {...detailDrawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
