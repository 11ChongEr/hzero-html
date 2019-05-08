/**
 * fileAggregate - 文件汇总查询
 * @date: 2018-9-20
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import Filter from './Filter';
import TableList from './TableList';

@connect(({ fileAggregate, loading }) => ({
  fileAggregate,
  organizationId: getCurrentOrganizationId(),
  loading: loading.effects['fileAggregate/queryFileList'],
}))
@formatterCollections({ code: ['hfile.fileAggregate'] })
export default class FileAggregate extends PureComponent {
  state = {
    formValues: {}, // 查询表单中的值
  };

  componentDidMount() {
    this.queryFileList();
    this.queryFiletype();
    this.queryFileFormat();
    this.queryFileUnit();
  }

  /**
   * 获取文件列表
   *
   * @param {*} [params={}]
   * @memberof FileAggregate
   */
  @Bind()
  queryFileList(params = {}) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'fileAggregate/queryFileList',
      payload: { organizationId, ...params },
    });
  }

  /**
   * 获取文件类型
   *
   * @memberof FileAggregate
   */
  @Bind()
  queryFiletype() {
    const { dispatch } = this.props;
    dispatch({
      type: 'fileAggregate/queryFiletype',
    });
  }

  /**
   * 获取文件格式
   *
   * @memberof FileAggregate
   */
  @Bind()
  queryFileFormat() {
    const { dispatch } = this.props;
    dispatch({
      type: 'fileAggregate/queryFileFormat',
    });
  }

  /**
   * 获取单位
   *
   * @memberof FileAggregate
   */
  @Bind()
  queryFileUnit() {
    const { dispatch } = this.props;
    dispatch({
      type: 'fileAggregate/queryFileUnit',
    });
  }

  /**
   * 获取表单的值
   *
   * @param {*} values
   * @memberof TemplateServiceMap
   */
  @Bind()
  storeFormValues(values) {
    this.setState({
      formValues: { ...values },
    });
  }

  render() {
    const {
      fileAggregate: { fileData = {}, fileTypeList = [], fileFormatList = [], fileUnitList = [] },
      loading,
    } = this.props;
    const { formValues = {} } = this.state;
    const listProps = {
      fileData,
      formValues,
      loading,
      onSearch: this.queryFileList,
    };
    const filterProps = {
      fileTypeList,
      fileFormatList,
      fileUnitList,
      onSearch: this.queryFileList,
      onStoreFormValues: this.storeFormValues,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hfile.fileAggregate.view.message.title').d('文件汇总查询')} />
        <Content>
          <div className="table-list-search">
            <Filter {...filterProps} />
          </div>
          <TableList {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
