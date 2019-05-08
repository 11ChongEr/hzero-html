import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';

const { Option } = Select;
/**
 * 数据集查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hrpt/report-query/list' })
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
      reportTypeList = [],
    } = this.props;
    return (
      <Fragment>
        <Form layout="inline">
          <Form.Item
            label={intl.get('hrpt.reportQuery.model.reportQuery.reportCode').d('报表代码')}
          >
            {getFieldDecorator('reportCode', {})(
              <Input typeCase="upper" trim inputChinese={false} />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hrpt.reportQuery.model.reportQuery.reportName').d('报表名称')}
          >
            {getFieldDecorator('reportName', {})(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hrpt.reportQuery.model.reportQuery.reportTypeCode').d('报表类型')}
          >
            {getFieldDecorator('reportTypeCode', {})(
              <Select allowClear style={{ width: '169px' }}>
                {reportTypeList.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Option>
                ))}
              </Select>
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
