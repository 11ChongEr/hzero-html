/**
 * Bank - 银行定义
 * @date: 2018-6-28
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Select, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';
import { Header, Content } from 'components/Page';
import OptionInput from 'components/OptionInput';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { createPagination, getCurrentOrganizationId } from 'utils/utils';

import BankForm from './BankForm';

@connect(({ bank, loading }) => ({
  bank,
  tenantId: getCurrentOrganizationId(),
  loading: loading.effects['bank/fetch'],
  saving: loading.effects['bank/action'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: 'hpfm.bank' })
@cacheComponent({ cacheKey: 'hpfm.bank' })
export default class BankList extends PureComponent {
  state = {
    bank: {},
  };

  bankForm;

  prevPagination; // 存储上一次的分页信息, 不参与视图渲染

  @Bind()
  showCreateForm() {
    this.showEditModal({
      enabledFlag: 1,
    });
  }

  @Bind()
  showModal() {
    this.handleModalVisible(true);
  }

  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  handleModalVisible(flag) {
    const { dispatch } = this.props;
    if (flag === false && this.bankForm) {
      this.bankForm.resetForm();
    }
    dispatch({
      type: 'bank/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  @Bind()
  handleAdd(fieldsValue) {
    const { dispatch, tenantId } = this.props;
    const { bank = {} } = this.state;
    dispatch({
      type: 'bank/action',
      method: 'updateBank',
      payload: {
        tenantId,
        ...bank,
        ...fieldsValue,
      },
    }).then(response => {
      if (response) {
        this.hideModal();
        this.reloadList();
        notification.success();
      }
    });
  }

  componentDidMount() {
    const {
      bank: { list },
      dispatch,
    } = this.props;
    dispatch({
      type: 'bank/init',
    });
    if (!list.content) {
      this.queryList();
    }
  }

  queryList({ page, sort } = {}) {
    this.prevPagination = { page, sort };
    const { form, dispatch, tenantId } = this.props;
    form.validateFields((err, fieldsValue) => {
      const { option, ...otherValue } = fieldsValue;
      dispatch({
        type: 'bank/fetch',
        payload: {
          tenantId,
          page,
          sort,
          body: {
            ...option,
            ...otherValue,
          },
        },
      });
    });
  }

  reloadList() {
    this.queryList(this.prevPagination);
  }

  @Bind()
  handleStandardTableChange(pagination, filtersArg, sorter) {
    const params = {
      page: pagination,
    };
    if (sorter.field) {
      params.sort = sorter;
    }
    this.queryList(params);
  }

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
  };

  handleSearch = e => {
    e.preventDefault();
    this.queryList();
  };

  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const { bank } = this.props;
    const queryArray = [
      {
        queryLabel: intl.get('hpfm.bank.model.bank.bankCode').d('银行代码'),
        queryName: 'bankCode',
        inputProps: {
          inputChinese: false,
        },
      },
      {
        queryLabel: intl.get('hpfm.bank.model.bank.bankName').d('银行名称'),
        queryName: 'bankName',
      },
      {
        queryLabel: intl.get('hpfm.bank.model.bank.bankShortName').d('银行简称'),
        queryName: 'bankShortName',
      },
    ];
    return (
      <Form layout="inline">
        <Form.Item>
          {getFieldDecorator('option')(
            <OptionInput style={{ width: '300px' }} queryArray={queryArray} />
          )}
        </Form.Item>
        <Form.Item label={intl.get('hpfm.bank.model.bank.bankType').d('银行类型')}>
          {getFieldDecorator('bankTypeCode')(
            <Select style={{ width: '200px' }} allowClear>
              {bank.bankTypeList.map(m => {
                return (
                  <Select.Option key={m.value} value={m.value}>
                    {m.meaning}
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Button onClick={this.handleSearch} type="primary" htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </Form.Item>
      </Form>
    );
  }

  @Bind()
  showEditModal(bank) {
    this.setState({
      bank,
    });
    this.showModal();
  }

  render() {
    const {
      bank: { list, modalVisible },
      loading,
      saving,
    } = this.props;
    const { bank } = this.state;
    const columns = [
      {
        title: intl.get('hpfm.bank.model.bank.bankCode'),
        width: 150,
        dataIndex: 'bankCode',
      },
      {
        title: intl.get('hpfm.bank.model.bank.bankName'),
        dataIndex: 'bankName',
      },
      {
        title: intl.get('hpfm.bank.model.bank.bankShortName'),
        width: 200,
        dataIndex: 'bankShortName',
      },
      {
        title: intl.get('hpfm.bank.model.bank.bankType'),
        width: 200,
        dataIndex: 'bankTypeMeaning',
      },
      {
        title: intl.get('hzero.common.status'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action'),
        width: 100,
        render: (_, record) => (
          <a
            onClick={() => {
              this.showEditModal(record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];

    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.bank.view.message.title').d('银行定义')}>
          <Button icon="plus" type="primary" onClick={this.showCreateForm}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          <Table
            bordered
            loading={loading}
            rowKey="bankId"
            dataSource={list.content}
            columns={columns}
            pagination={createPagination(list)}
            onChange={this.handleStandardTableChange}
          />
        </Content>
        <BankForm
          sideBar
          title={
            bank.bankId
              ? intl.get('hpfm.bank.view.message.editBank').d('编辑银行')
              : intl.get('hpfm.bank.view.message.newBank').d('新建银行')
          }
          onRef={ref => {
            this.bankForm = ref;
          }}
          data={bank}
          handleAdd={this.handleAdd}
          confirmLoading={saving}
          modalVisible={modalVisible}
          hideModal={this.hideModal}
        />
      </React.Fragment>
    );
  }
}
