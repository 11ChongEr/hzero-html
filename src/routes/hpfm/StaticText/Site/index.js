/**
 * 静态文本管理 列表
 * @date 2018-12-25
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { find } from 'lodash';
import { Button, Popconfirm, Table } from 'hzero-ui';
import querystring from 'querystring';

import { Content, Header } from 'components/Page';
import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchForm from './SearchForm';

const cursorPointStyle = {
  cursor: 'pointer',
};

function exTreeKey(list, exList) {
  if (list) {
    for (let i = 0; i < list.length; i++) {
      exList.push(list[i].textId);
      if (list[i].children) {
        exTreeKey(list[i].children, exList);
      }
    }
  }
}

const checkboxDisabledProps = {
  disabled: true,
};

const checkboxEmptyProps = {};

@formatterCollections({
  code: ['entity.company', 'entity.tenant', 'entity.lang', 'hpfm.staticText'],
})
@connect(({ loading, staticText }) => {
  return {
    fetchStaticTextListLoading: loading.effects['staticText/fetchStaticTextList'],
    removeStaticTextListLoading: loading.effects['staticText/removeStaticTextList'],
    removeStaticTextOneLoading: loading.effects['staticText/removeStaticTextOne'],
    staticText: staticText.list,
  };
})
@cacheComponent({ cacheKey: '/hpfm/static-text/list' })
export default class StaticText extends React.Component {
  state = {
    rowSelection: {
      onChange: this.handleRowSelectionChange,
      onSelectAll: this.handleRowSelectionChange.bind(this, 'all_none'),
      getCheckboxProps: this.getCheckboxProps,
      selectedRowKeys: [],
    },
    expandedList: [],
  };

  searchFormRef;

  static getDerivedStateFromProps(nextProps, prevState) {
    const { dataSource } = nextProps.staticText;
    const { prevDataSource } = prevState;
    if (dataSource !== prevDataSource) {
      return {
        dataSource,
        prevDataSource: dataSource,
      };
    }
    return null;
  }

  componentDidMount() {
    this.reloadList();
  }

  @Bind()
  getCheckboxProps(record) {
    return record.hitAncestor ? checkboxDisabledProps : checkboxEmptyProps;
  }

  render() {
    const {
      staticText: { pagination = false },
      fetchStaticTextListLoading,
      removeStaticTextListLoading,
      removeStaticTextOneLoading,
    } = this.props;
    const { selectedRows = [], rowSelection = null, dataSource = [] } = this.state;
    const removeBtnDisabled = selectedRows.length === 0;
    const removeBtnLoading = removeStaticTextListLoading || removeStaticTextOneLoading;
    const tableLoading = removeBtnLoading || fetchStaticTextListLoading;
    return (
      <React.Fragment>
        <Header
          key="header"
          title={intl.get('hpfm.staticText.view.message.title').d('静态文本管理')}
        >
          <Button key="create" icon="plus" type="primary" onClick={this.handleCreateBtnClick}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            key="remove"
            icon="delete"
            disabled={removeBtnDisabled}
            onClick={this.handleRemoveBtnClick}
            loading={removeBtnLoading}
          >
            {intl.get('hzero.common.button.remove').d('移除')}
          </Button>
        </Header>
        <Content key="content">
          <SearchForm
            key="searchForm"
            onRef={this.handleSearchFormRef}
            onSearch={this.handleFetchList}
          />
          <Table
            bordered
            key="table"
            rowKey="textId"
            uncontrolled
            expandedRowKeys={this.state.expandedList}
            rowSelection={rowSelection}
            dataSource={dataSource}
            pagination={pagination}
            loading={tableLoading}
            columns={this.columns}
            onChange={this.handleTableChange}
          />
        </Content>
      </React.Fragment>
    );
  }

  @Bind()
  handleCreateBtnClick() {
    this.handleGotoDetail('create');
  }

  @Bind()
  handleGotoDetail(action, params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'staticText/clearDetail',
    });
    dispatch(
      routerRedux.push({
        pathname: `/hpfm/static-text/detail/${action}`,
        search: querystring.stringify(params),
      })
    );
  }

  @Bind()
  handleRemoveBtnClick() {
    const { selectedRows = [] } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'staticText/removeStaticTextList',
      payload: {
        params: selectedRows,
      },
    }).then(res => {
      if (res) {
        this.handleFetchList();
      }
    });
  }

  @Bind()
  handleSearchFormRef(searchFormRef) {
    this.searchFormRef = searchFormRef;
  }

  @Bind()
  handleFetchList(pagination = {}) {
    this.setState({ pagination });
    this.handleRowSelectionChange(); // 清空选中的数据
    const { dispatch } = this.props;
    let params = {};
    const exList = [];
    if (this.searchFormRef) {
      params = this.searchFormRef.props.form.getFieldsValue();
    }
    dispatch({
      type: 'staticText/fetchStaticTextList',
      payload: {
        params: {
          ...pagination,
          ...params,
        },
      },
    }).then(res => {
      const { title = '', textCode = '' } = params;
      if ((title || textCode) && res && res.content && Array.isArray(res.content)) {
        exTreeKey(res.content, exList);
        this.setState({ expandedList: exList });
      } else {
        this.setState({ expandedList: [] });
      }
    });
  }

  @Bind()
  reloadList() {
    const { pagination } = this.state;
    this.handleFetchList(pagination);
  }

  @Bind()
  handleRemoveOne(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'staticText/removeStaticTextOne',
      payload: {
        params: [record],
      },
    }).then(res => {
      if (res) {
        this.handleFetchList();
      }
    });
  }

  // table

  @Bind()
  handleCreateClick(record) {
    this.handleGotoDetail('create', {
      parentId: record.textId,
      parentTitle: record.title,
      parentDescription: record.description,
      parentTextCode: record.textCode,
    });
  }

  @Bind()
  handleEditClick(record) {
    this.handleGotoDetail('edit', { textId: record.textId });
  }

  @Bind()
  handleRemoveClick(record) {
    this.handleRemoveOne(record);
  }

  @Bind()
  handleTableChange(page, filter, sort) {
    this.handleFetchList({ page, sort });
  }

  /**
   * 遍历树结构的数据
   * @param {object[]} ds - 数据
   * @param {boolean} hit - 是否命中 选中, 由本函数自动传参
   * @param {{hitFunc: Function, travelFunc: Function, travelDeep: boolean}} options - 配置
   */
  @Bind()
  travelDataSource(ds, hit = false, options) {
    const { hitFunc, travelFunc, travelDeep = false } = options;
    const newDs = [];
    if (ds) {
      ds.forEach(r => {
        const newR = { ...r };
        newDs.push(newR);
        if (hitFunc(newR)) {
          newR.children = this.travelDataSource(r.children, true, options);
          newR.hitAncestor = travelFunc(newR, { hit: true, hitParent: hit });
          return;
        }
        if (travelDeep) {
          newR.children = this.travelDataSource(r.children, hit, options);
          newR.hitAncestor = travelFunc(newR, { hit: false, hitParent: hit });
          return;
        }
        if (hit) {
          newR.children = this.travelDataSource(r.children, false, options);
          newR.hitAncestor = travelFunc(newR, { hit: false, hitParent: true });
        } else {
          newR.children = this.travelDataSource(r.children, false, options);
          newR.hitAncestor = travelFunc(newR, { hit: false, hitParent: false });
        }
      });
    }
    if (newDs.length === 0) {
      return undefined;
    }
    return newDs;
  }

  @Bind()
  handleRowSelectionChange(selectStatus, selectedRows = []) {
    // TODO: 要做复杂的判断
    const { rowSelection, dataSource = [] } = this.state;
    const prevRowSelection = rowSelection || {
      onChange: this.handleRowSelectionChange,
      onSelectAll: this.handleRowSelectionChange.bind(this, 'all_none'),
      getCheckboxProps: this.getCheckboxProps,
    };
    const { selectedRowKeys: preSelectedRowKeys = [] } = prevRowSelection;
    const diffObj = {
      diffLen: selectedRows.length - preSelectedRowKeys.length,
    };

    const nextPartialState = {
      rowSelection: {
        ...prevRowSelection,
        selectedRowKeys: [],
        onChange: this.handleRowSelectionChange,
        onSelectAll: this.handleRowSelectionChange.bind(this, 'all_none'),
        getCheckboxProps: this.getCheckboxProps,
      },
      selectedRows: [],
    };

    if (selectStatus === 'all_none') {
      // 全选或者取消全选
      if (selectedRows) {
        diffObj.selectAllStatus = 'all';
      } else {
        diffObj.selectAllStatus = 'none';
      }
    }

    // 选中项目新增
    // 如果是选中的父节点, 子节点对应选中
    // 新增额外的
    nextPartialState.dataSource = this.travelDataSource(dataSource, false, {
      hitFunc(record) {
        if (diffObj.selectAllStatus === 'all') {
          return true;
        }
        if (diffObj.selectAllStatus === 'none') {
          return false;
        }
        return !!find(selectedRows, r => r.textId === record.textId);
      },
      travelFunc(record, { hit, hitParent }) {
        if (hit || hitParent) {
          nextPartialState.selectedRows.push(record);
          nextPartialState.rowSelection.selectedRowKeys.push(record.textId);
        }
        return !!hitParent;
      },
      travelDeep: true,
    });

    this.setState(nextPartialState);
  }

  columns = [
    {
      title: intl.get('hpfm.staticText.model.staticText.title').d('标题'),
      dataIndex: 'title',
    },
    {
      title: intl.get('hpfm.staticText.model.staticText.code').d('编码'),
      width: 140,
      dataIndex: 'textCode',
    },
    {
      title: intl.get('hpfm.staticText.model.staticText.description').d('描述'),
      dataIndex: 'description',
    },
    {
      title: intl.get('entity.tenant.tag').d('租户'),
      dataIndex: 'tenantName',
    },
    {
      title: intl.get('entity.company.tag').d('公司'),
      dataIndex: 'companyName',
    },
    {
      title: intl.get('hzero.common.date.active.from').d('有效日期从'),
      width: 160,
      dataIndex: 'startDate',
    },
    {
      title: intl.get('hzero.common.date.active.to').d('有效日期至'),
      width: 160,
      dataIndex: 'endDate',
    },
    {
      title: intl.get('hzero.common.button.action').d('操作'),
      width: 150,
      render: (text, record) => {
        return (
          <span className="action-link">
            <span
              style={cursorPointStyle}
              onClick={() => {
                this.handleCreateClick(record);
              }}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </span>
            <span
              style={cursorPointStyle}
              onClick={() => {
                this.handleEditClick(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </span>
            <Popconfirm
              title={intl.get('hpfm.staticText.view.message.confirm.delete').d('确定删除该文本吗?')}
              onConfirm={() => {
                this.handleRemoveClick(record);
              }}
            >
              <span style={cursorPointStyle}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </span>
            </Popconfirm>
          </span>
        );
      },
    },
  ];
}
