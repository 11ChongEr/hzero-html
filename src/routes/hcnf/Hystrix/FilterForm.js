/*
 * FilterForm - 熔断设置查询表单
 * @date: 2018/09/11 10:44:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, Row, Col, Icon, Select } from 'hzero-ui';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { map } from 'lodash';

const promptCode = 'hsgp.hystrix';
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
  style: { width: '100%' },
};
const formLayoutFirst = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
  style: { width: '100%' },
};
/**
 * 熔断保护设置查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch //搜索
 * @reactProps {Function} handleFormReset //重置表单
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hsgp/hystrix/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
    };
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   *	表单查询
   */
  @Bind()
  handleSearch() {
    const { onFilterChange, form } = this.props;
    if (onFilterChange) {
      form.validateFields((err, values) => {
        if (!err) {
          onFilterChange(values);
        }
      });
    }
  }

  /**
   *	表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      confTypeCodeList,
    } = this.props;
    const { display = true } = this.state;
    const refreshStatusArr = [
      { value: 0, meaning: '刷新失败' },
      { value: 1, meaning: '刷新成功' },
      { value: 2, meaning: '未刷新' },
    ];
    return (
      <Fragment>
        <Form layout="inline">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    {...formLayoutFirst}
                    label={intl.get(`${promptCode}.model.hystrix.confTypeCode`).d(`代码`)}
                  >
                    {getFieldDecorator('confTypeCode')(
                      <Input trim typeCase="upper" inputChinese={false} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    {...formItemLayout}
                    label={intl.get(`${promptCode}.model.hystrix.confKey`).d(`类型`)}
                  >
                    {getFieldDecorator('confKey')(
                      <Select style={{ width: '100%' }} allowClear>
                        {map(confTypeCodeList, e => {
                          return (
                            <Option value={e.value} key={e.value}>
                              {e.meaning}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    {...formItemLayout}
                    label={intl.get(`${promptCode}.model.hystrix.remark`).d(`描述`)}
                  >
                    {getFieldDecorator('remark')(<Input />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                <Col span={8}>
                  <Form.Item
                    {...formLayoutFirst}
                    label={intl.get(`${promptCode}.model.hystrix.serviceName`).d(`服务`)}
                  >
                    {getFieldDecorator('serviceName')(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    {...formItemLayout}
                    label={intl.get(`${promptCode}.model.hystrix.refreshStatus`).d(`刷新状态`)}
                  >
                    {getFieldDecorator('refreshStatus')(
                      <Select allowClear>
                        {map(refreshStatusArr, e => {
                          return (
                            <Option value={e.value} key={e.value}>
                              {e.meaning}
                            </Option>
                          );
                        })}
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
                  {intl.get(`hzero.common.button.search`).d('查询')}
                </Button>
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get(`hzero.common.button.reset`).d('重置')}
                </Button>
                <a
                  style={{ marginLeft: 8, display: display ? 'inline-block' : 'none' }}
                  onClick={this.toggleForm}
                >
                  {intl.get(`hzero.common.button.expand`).d('展开')} <Icon type="down" />
                </a>
                <a
                  style={{ marginLeft: 8, display: display ? 'none' : 'inline-block' }}
                  onClick={this.toggleForm}
                >
                  {intl.get(`hzero.common.button.up`).d('收起')} <Icon type="up" />
                </a>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Fragment>
    );
  }
}
