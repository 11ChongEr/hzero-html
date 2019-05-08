import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * 数据集查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hrpt/data-set/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行search
          onSearch();
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Fragment>
        <Form layout="inline">
          <Form.Item
            label={intl.get('hrpt.reportDataSet.model.reportDataSet.datasetCode').d('数据集代码')}
          >
            {getFieldDecorator('datasetCode', {})(
              <Input typeCase="upper" trim inputChinese={false} />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hrpt.reportDataSet.model.reportDataSet.datasetName').d('数据集名称')}
          >
            {getFieldDecorator('datasetName', {})(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hrpt.reportDataSet.model.reportDataSet.datasourceId').d('数据源')}
          >
            {getFieldDecorator('datasourceId', {})(
              <Lov code="HPFM.DATASOURCE" queryParams={{ dsPurposeCode: 'DR' }} />
            )}
          </Form.Item>
          <Form.Item>
            <Button data-code="search" type="primary" htmlType="submit" onClick={this.handleSearch}>
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
            <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              {intl.get('hzero.common.status.reset').d('重置')}
            </Button>
          </Form.Item>
        </Form>
      </Fragment>
    );
  }
}
