/**
 * index.js - 值集定义
 * @date: 2018-10-26
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Button, Row, Col, Tag } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import SearchPage from 'components/SearchPage';
import { Header } from 'components/Page';
import Lov from 'components/Lov';

import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import CreateForm from './ListForm';

const FormItem = Form.Item;
const { Option } = Select;

@connect(({ valueList, loading }) => ({
  valueList,
  list: valueList.list,
  loading: loading.effects['valueList/queryLovHeadersList'],
  saving: loading.effects['valueList/saveLovHeaders'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['hpfm.valueList', 'hpfm.common'],
})
export default class TableList extends SearchPage {
  createForm; // 侧边栏内部引用

  @Bind()
  pageConfig() {
    const { tenantId } = this.props;
    return {
      modelName: 'valueList',
      customSearch: true,
      cacheKey: '/hpfm/value-list/list',
      searchDispatch: 'valueList/queryLovHeadersList',
      searchCallback: this.searchCallback,
      otherParams: { tenantId: isTenantRoleLevel() ? tenantId : '' },
    };
  }

  /**
   * 显示侧边栏
   */
  @Bind()
  showModal() {
    this.handleModalVisible(true);
  }

  /**
   * 隐藏侧边栏
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  /**
   * 侧边栏显示控制函数
   * @param {Boolean} flag - 显示隐藏参数
   */
  handleModalVisible(flag) {
    if (flag === false && this.createForm) {
      this.createForm.resetForm();
    }
    this.setState({
      modalVisible: !!flag,
    });
  }

  /**
   * 搜索回调
   */
  @Bind()
  searchCallback() {
    this.setState({
      selectedRows: [],
    });
  }

  /**
   * 新建值集
   */
  @Bind()
  handleAdd(fieldsValue) {
    const { history, dispatch, tenantId } = this.props;
    const { parentTenantId } = this.state;
    // TODO: 校验表单
    dispatch({
      type: 'valueList/saveLovHeaders',
      payload: {
        tenantId,
        ...fieldsValue,
        enabledFlag: 1,
        mustPageFlag: 1,
        parentTenantId,
      },
    }).then(response => {
      if (response) {
        this.hideModal();
        notification.success();
        history.push(`/hpfm/value-list/detail/${response.lovId}`);
      }
    });
  }

  @Bind()
  handleParentLovChange(record) {
    this.setState({
      parentTenantId: record.tenantId,
    });
  }

  /**
   * 设置单元格属性
   */
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 300,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * 值集列表查询条件表单组件
   */
  renderForm(form) {
    const { getFieldDecorator } = form;
    const {
      valueList: { lovType },
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('hpfm.valueList.model.header.lovCode').d('值集编码')}
                >
                  {getFieldDecorator('lovCode')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('hpfm.valueList.model.header.lovName').d('值集名称')}
                >
                  {getFieldDecorator('lovName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('hpfm.valueList.model.header.lovTypeCode').d('值集类型')}
                >
                  {getFieldDecorator('lovTypeCode')(
                    <Select style={{ width: 150 }} allowClear>
                      {lovType.map(m => {
                        return (
                          <Option key={m.value} value={m.value}>
                            {m.meaning}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              {!isTenantRoleLevel() && (
                <Col span={8}>
                  <Form.Item
                    {...formItemLayout}
                    label={intl.get('hpfm.valueList.model.header.tenantName').d('所属租户')}
                  >
                    {getFieldDecorator('tenantId')(
                      <Lov code="HPFM.TENANT" textField="tenantName" />
                    )}
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Col>
          <Col span={6}>
            <Form.Item>
              <Button type="primary" htmlType="submit" onClick={this.filterForm.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.filterForm.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  renderOther() {
    const {
      saving,
      valueList: { lovType },
    } = this.props;
    return (
      <CreateForm
        title={intl.get('hpfm.valueList.view.title.create').d('新增值集')}
        onRef={ref => {
          this.createForm = ref;
        }}
        handleAdd={this.handleAdd}
        confirmLoading={saving}
        modalVisible={this.state.modalVisible}
        hideModal={this.hideModal}
        width={800}
        lovType={lovType}
        onParentLovChange={this.handleParentLovChange}
      />
    );
  }

  renderHeader() {
    const { selectedRows = [] } = this.state;
    return (
      <Header title={intl.get('hpfm.valueList.view.title.valueList').d('值集定义')}>
        <Button icon="plus" type="primary" onClick={this.showModal}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        {!isEmpty(selectedRows) && (
          <Button icon="minus" onClick={this.handleDeleteLov}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        )}
      </Header>
    );
  }

  tableProps() {
    const {
      history,
      valueList: { lovType },
      loading,
      tenantId,
    } = this.props;
    const columns = [
      !isTenantRoleLevel() && {
        title: intl.get('hpfm.valueList.model.header.tenantName').d('所属租户'),
        width: 200,
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('hpfm.valueList.model.header.lovCode').d('值集编码'),
        width: 200,
        dataIndex: 'lovCode',
      },
      {
        title: intl.get('hpfm.valueList.model.header.lovName').d('值集名称'),
        width: 200,
        dataIndex: 'lovName',
      },
      {
        title: intl.get('hpfm.valueList.model.header.lovTypeCode').d('值集类型'),
        width: 100,
        align: 'center',
        dataIndex: 'lovTypeCode',
        render: value => {
          const result = lovType.find(item => item.value === value);
          return result ? result.meaning : value;
        },
      },
      {
        title: intl.get('hpfm.valueList.model.header.routeName').d('目标路由名'),
        width: 120,
        dataIndex: 'routeName',
      },
      {
        title: intl.get('hpfm.valueList.model.header.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        align: 'center',
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      isTenantRoleLevel() && {
        title: intl.get('hzero.common.source').d('来源'),
        align: 'center',
        width: 100,
        render: (_, record) => {
          return tenantId === record.tenantId ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 100,
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                history.push(`/hpfm/value-list/detail/${record.lovId}`);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ].filter(Boolean);
    return {
      rowKey: 'lovId',
      columns,
      rowSelection: null,
      loading,
    };
  }
}
