/**
 * PageDetail.js
 * @date 2018/9/29
 * @author WY yang.wang06@hand-china.com
 * @copyright (c) 2018 Hand
 */

import React from 'react';
import { connect } from 'dva';
import { Button, Form, Table, Input } from 'hzero-ui';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import EditModal from '../../components/EditModal';

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hpfm.ui'] })
@connect(({ loading, uiPage }) => {
  return {
    fetching: loading.effects['uiPage/fetchList'],
    uiPage,
  };
})
@cacheComponent({ cacheKey: '/hpfm/ui/page/list' })
export default class PageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Modal
      createModalProps: {
        visible: false,
      },
      updateModalProps: {
        visible: false,
      },
      // 分页
      pagination: {},
    };
  }

  render() {
    const {
      uiPage: { list = {}, pagination = {} },
      fetching,
    } = this.props;
    const { createModalProps = {}, updateModalProps = {}, editRecord } = this.state;
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.ui.view.list.title').d('页面汇总')}>
          <Button icon="plus" type="primary" onClick={this.handleCreateBtnClick}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderSearchForm()}</div>
          <Table
            rowKey="pageId"
            bordered
            columns={this.getColumns()}
            pagination={pagination}
            dataSource={list.content}
            onChange={this.handleStandardTableChange}
            loading={fetching}
          />
          <EditModal
            modalProps={createModalProps}
            onOk={this.handlePageCreate}
            onCancel={this.handleCancelCreate}
            title={intl.get('hpfm.ui.view.list.modal.create.title').d('新建页面')}
            isCreate
          />
          <EditModal
            modalProps={updateModalProps}
            onOk={this.handlePageUpdate}
            onCancel={this.handleCancelUpdate}
            editRecord={editRecord}
            title={intl.get('hpfm.ui.view.list.modal.edit.title').d('编辑页面')}
            wrapClassName="ant-modal-sidebar-right"
            transitionName="move-right"
          />
        </Content>
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.reloadList();
  }

  /**
   * render search form
   * @returns {*}
   */
  renderSearchForm() {
    const { form } = this.props;
    return (
      <Form layout="inline">
        <Form.Item label={intl.get('hpfm.ui.model.page.pageCode').d('页面编码')}>
          {form.getFieldDecorator('pageCode')(<Input trim typeCase="upper" inputChinese={false} />)}
        </Form.Item>
        <Form.Item label={intl.get('hpfm.ui.model.page.description').d('页面描述')}>
          {form.getFieldDecorator('description')(<Input />)}
        </Form.Item>
        <Form.Item className="table-list-operator">
          <Button type="primary" htmlType="submit" onClick={this.handleSearchBtnClick}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button onClick={this.handleResetBtnClick}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </Form.Item>
      </Form>
    );
  }

  /**
   * get table's columns
   * @returns {object[]} columns
   */
  getColumns() {
    if (!this.columns) {
      this.columns = [
        {
          title: intl.get('hpfm.ui.model.page.pageCode').d('页面编码'),
          dataIndex: 'pageCode',
          width: 200,
        },
        {
          title: intl.get('hpfm.ui.model.page.description').d('页面描述'),
          dataIndex: 'description',
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          key: 'action',
          width: 150,
          render: (_, record) => {
            return (
              <span className="action-link">
                <a
                  onClick={e => {
                    e.preventDefault();
                    this.handlePageUpdateTrigger(record);
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
                <a
                  onClick={e => {
                    e.preventDefault();
                    this.handleEditPage(record.pageCode);
                  }}
                >
                  页面设计
                </a>
              </span>
            );
          },
        },
      ];
    }
    return this.columns;
  }

  /**
   * search btn click, trigger queryList
   * @param {CompositionEvent} e
   */
  @Bind()
  handleSearchBtnClick(e) {
    e.preventDefault();
    this.queryList();
  }

  /**
   * reset search form
   */
  @Bind()
  handleResetBtnClick() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * reload list
   */
  reloadList() {
    const { pagination } = this.state;
    this.queryList(pagination);
  }

  /**
   * query list
   * @param {Number} pagination.pagination
   * @param {Number} pagination.sorter
   */
  queryList(pagination = {}) {
    const { form, dispatch } = this.props;
    const formValues = form.getFieldsValue();
    this.setState({
      pagination,
    });
    dispatch({
      type: 'uiPage/fetchList',
      payload: {
        body: formValues,
        page: pagination.pagination,
        sort: pagination.sorter,
      },
    });
  }

  /**
   * table change
   */
  @Bind()
  handleStandardTableChange(pagination, filtersArg, sorter) {
    this.queryList({ pagination, filtersArg, sorter });
  }

  /**
   * goto pageDetail
   * @param pageCode
   */
  @Bind()
  handleEditPage(pageCode) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hpfm/ui/page/detail/${pageCode}`,
      })
    );
  }

  /**
   * create btn click
   */
  @Bind()
  handleCreateBtnClick() {
    this.setState({
      createModalProps: {
        visible: true,
      },
    });
  }

  /**
   * edit record, open edit modal
   * @param record
   */
  @Bind()
  handlePageUpdateTrigger(record) {
    this.setState({
      editRecord: record,
      updateModalProps: {
        visible: true,
      },
    });
  }

  /**
   * cancel create
   */
  @Bind()
  handleCancelCreate() {
    this.setState({
      createModalProps: {
        visible: false,
      },
    });
  }

  /**
   * cancel update
   */
  @Bind()
  handleCancelUpdate() {
    this.setState({
      editRecord: null,
      updateModalProps: {
        visible: false,
      },
    });
  }

  /**
   * create page
   * @param data
   */
  @Bind()
  handlePageCreate(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'uiPage/listCreateOne',
      payload: data,
    }).then(res => {
      if (res) {
        this.setState({
          createModalProps: {
            visible: false,
          },
        });
        this.reloadList();
      }
    });
  }

  /**
   * update page
   * @param data
   */
  @Bind()
  handlePageUpdate(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'uiPage/listUpdateOne',
      payload: data,
    }).then(res => {
      if (res) {
        this.setState({
          updateModalProps: {
            visible: false,
          },
        });
        this.reloadList();
      }
    });
  }
}
