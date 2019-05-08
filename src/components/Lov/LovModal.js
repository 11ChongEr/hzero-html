import React from 'react';
import { Input, Form, Button, Table, Row, Col } from 'hzero-ui';
import { isArray, isEmpty, isFunction } from 'lodash';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { createPagination, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import './index.less';
import { queryLovData } from '../../services/api';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

const defaultRowKey = 'lovId';
@Form.create({ fieldNameProp: null })
class LovModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      list: [],
      treeKeys: [],
      pagination: {},
      loading: false,
    };
  }

  setSateData(state) {
    if (this.mounted) {
      this.setState(state);
    }
  }

  componentDidMount() {
    const { delayLoadFlag } = this.props.lov;
    this.mounted = true;
    if (this.mounted && !delayLoadFlag) {
      this.queryData();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    // TODO: 支持多选
    const record = selectedRows[0];
    this.props.onSelect(record);
    this.setState({
      selectedRows: [record],
    });
  }

  @Bind()
  handleRowClick(record) {
    this.selectRecord(record);
  }

  selectRecord(record) {
    this.props.onSelect(record);
    this.setState({
      selectedRows: [record],
    });
  }

  @Bind()
  handleRowDoubleClick(record) {
    this.selectRecord(record);
    this.props.onClose();
  }

  hideLoading() {
    this.setState({
      loading: false,
    });
  }

  @Bind()
  queryData(pagination = {}) {
    const filter = this.props.form.getFieldsValue();
    const { queryUrl, pageSize, lovCode, lovTypeCode } = this.props.lov;
    const { queryParams = {} } = this.props;
    let nowQueryParams = queryParams || {};
    if (isFunction(nowQueryParams)) {
      nowQueryParams = nowQueryParams();
    }
    const queryIndex = queryUrl.indexOf('?');
    let sourceQueryParams = {};
    if (queryIndex !== -1) {
      sourceQueryParams = qs.parse(queryUrl.substr(queryIndex + 1));
    }
    const sourceParams = {
      ...filter,
      page: pagination.current - 1 || 0,
      size: pagination.pageSize || pageSize,
      ...sourceQueryParams,
      ...nowQueryParams,
    };
    const params =
      lovTypeCode !== 'URL'
        ? Object.assign(sourceParams, {
            lovCode,
          })
        : sourceParams;

    /**
     * 替换查询 Url 中的变量
     * @param {String} url
     * @param {Object} data
     */
    function getUrl(url, data) {
      let ret = url;
      const organizationRe = /\{organizationId\}|\{tenantId\}/g;
      Object.keys(data).map(key => {
        const re = new RegExp(`{${key}}`, 'g');
        ret = ret.replace(re, data[key]);
        return ret;
      });
      if (organizationRe.test(ret)) {
        ret = ret.replace(organizationRe, getCurrentOrganizationId());
      }
      const index = ret.indexOf('?'); // 查找是否有查询条件
      if (queryIndex !== -1) {
        ret = ret.substr(0, index);
      }
      return ret;
    }

    const url = getUrl(queryUrl, queryParams);

    this.setState(
      {
        loading: true,
      },
      () => {
        queryLovData(url, params)
          .then(res => {
            if (res) {
              this.dataFilter(res);
            }
          })
          .then(() => {
            // 还需要将 Lov 的选中数据清空
            const { onSelect } = this.props;
            onSelect();
            this.setState({
              selectedRows: [],
            });
          })
          .finally(() => {
            this.hideLoading();
          });
      }
    );
  }

  @Bind()
  formReset() {
    this.props.form.resetFields();
  }

  /**
   * 树 child 属性更改
   * @param {Array} list 原树结构数据
   * @param {String} childName 要替换的 childName
   */
  @Bind()
  setChildren = (data, childName) => {
    return childName
      ? data.map(n => {
          const item = n;
          if (!isEmpty(n[childName])) {
            this.defineProperty(item, 'children', [{ ...n[childName] }]);
          }
          if (!isEmpty(item.children)) {
            item.children = this.setChildren(item.children);
          }
          return item;
        })
      : data;
  };

  /**
   * 处理返回列表数据
   * @param {Object|Array} data - 返回的列表数据
   */
  @Bind()
  dataFilter(data) {
    const {
      lov: { valueField: rowkey = defaultRowKey, childrenFieldName },
    } = this.props;
    const isTree = isArray(data);
    const hasParams = !isEmpty(
      Object.values(this.props.form.getFieldsValue()).filter(e => e !== undefined && e !== '')
    );
    const list = isTree ? this.setChildren(data, childrenFieldName) : data.content;
    const pagination = !isTree && createPagination(data);

    const treeKeys = []; // 树状 key 列表
    if (isTree && hasParams) {
      /**
       * 遍历生成树列表
       * @param {*} treeList - 树列表数据
       */
      const flatKeys = treeList => {
        if (isArray(treeList.children) && !isEmpty(treeList.children)) {
          treeKeys.push(treeList[rowkey]);
          treeList.children.forEach(item => flatKeys(item));
        } else {
          treeKeys.push(treeList[rowkey]);
        }
      };

      list.forEach(item => flatKeys(item)); // 遍历生成 key 列表
    }

    this.setSateData({
      list,
      treeKeys,
      pagination,
    });
  }

  @Bind()
  defineProperty(obj, property, value) {
    Object.defineProperty(obj, property, {
      value,
      writable: true,
      enumerable: false,
      configurable: true,
    });
  }

  /**
   * 访问对象由字符串指定的多层属性
   * @param {Object} obj 访问的对象
   * @param {String} str 属性字符串，如 'a.b.c.d'
   */
  @Bind()
  parseField(obj, str) {
    if (/[.]/g.test(str)) {
      const arr = str.split('.');
      const newObj = obj[arr[0]];
      const newStr = arr.slice(1).join('.');
      return this.parseField(newObj, newStr);
    } else {
      return obj[str];
    }
  }

  render() {
    const {
      lov: { valueField: rowkey = defaultRowKey, tableFields = [], queryFields = [] },
      form: { getFieldDecorator },
      width,
    } = this.props;
    const { list = [], selectedRows, loading, pagination, treeKeys } = this.state;
    const isTree = isArray(list);
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: selectedRows.map(n => this.parseField(n, rowkey)),
      onChange: this.onSelectChange,
    };
    const tableProps = {
      loading,
      rowSelection,
      pagination,
      bordered: true,
      dataSource: list,
      columns: tableFields,
      onRow: (record, index) => {
        return {
          onDoubleClick: () => this.handleRowDoubleClick(record, index),
          onClick: () => this.handleRowClick(record, index),
        };
      },
      onChange: this.queryData,
    };
    const treeProps = isTree
      ? {
          uncontrolled: true,
          expandedRowKeys: treeKeys,
        }
      : {};

    // 查询条件表单
    const span = queryFields.length <= 1 || width <= 400 ? 24 : 12;
    const queryInput = queryFields.map(queryItem => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(<Input onPressEnter={this.queryData} />)}
          </FormItem>
        </Col>
      );
    });

    return (
      <React.Fragment>
        {queryFields.length > 0 ? (
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <Row style={{ flex: 'auto' }}>{queryInput}</Row>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Button type="primary" onClick={this.queryData} style={{ marginRight: 8 }}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button onClick={this.formReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </div>
          </div>
        ) : null}
        <Table
          resizable={false}
          rowKey={record => this.parseField(record, rowkey)}
          {...tableProps}
          {...treeProps}
        />
      </React.Fragment>
    );
  }
}

export default LovModal;
