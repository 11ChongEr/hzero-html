import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * 请求定义查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hsdr/concurrent/list' })
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
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get('hsdr.concurrent.model.concurrent.concCode').d('请求编码')}
                >
                  {getFieldDecorator('concCode')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get('hsdr.concurrent.model.concurrent.concName').d('请求名称')}
                >
                  {getFieldDecorator('concName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get('hsdr.concurrent.model.concurrent.concDescription').d('请求描述')}
                >
                  {getFieldDecorator('concDescription')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get('hsdr.concurrent.model.concurrent.enabledFlag').d('是否启用')}
                >
                  {getFieldDecorator('enabledFlag')(
                    <Select allowClear>
                      <Select.Option value={1} key="1">
                        {intl.get('hzero.common.status.yes').d('是')}
                      </Select.Option>
                      <Select.Option value={0} key="0">
                        {intl.get('hzero.common.status.no').d('否')}
                      </Select.Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
