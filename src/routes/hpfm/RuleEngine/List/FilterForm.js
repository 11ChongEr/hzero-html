import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, Select, Row, Col, Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const { Option } = Select;

/**
 * 规则引擎列表查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} search - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hpfm/rule-engine' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {
    display: true,
  };

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form, onStoreValues } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          // 如果验证成功,则执行search
          onSearch();
          onStoreValues(values);
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
   * render
   * @returns React.element
   */
  render() {
    const {
      scriptTypeCode = [],
      form: { getFieldDecorator },
      categoryList = [],
    } = this.props;
    const { display } = this.state;
    return (
      <Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row type="flex" justify="start">
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('hpfm.ruleEngine.model.ruleEngine.serverName').d('服务名称')}
                    {...formlayout}
                  >
                    {getFieldDecorator('serverName', {})(
                      <Lov
                        code={
                          isTenantRoleLevel()
                            ? 'HCNF.ROUTE.SERVICE_CODE.ORG'
                            : 'HCNF.ROUTE.SERVICE_CODE'
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('hpfm.ruleEngine.model.ruleEngine.scriptTypeCode').d('类型')}
                    {...formlayout}
                  >
                    {getFieldDecorator('scriptTypeCode', {})(
                      <Select allowClear>
                        {scriptTypeCode &&
                          scriptTypeCode.map(item => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label={intl.get('hzero.common.status').d('状态')} {...formlayout}>
                    {getFieldDecorator('enabledFlag', {})(
                      <Select allowClear>
                        <Option value={1}>
                          {intl.get('hzero.common.status.enable').d('启用')}
                        </Option>
                        <Option value={0}>
                          {intl.get('hzero.common.status.disable').d('禁用')}
                        </Option>
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                {!isTenantRoleLevel() && (
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hpfm.ruleEngine.model.ruleEngine.tenantId').d('租户')}
                      {...formlayout}
                    >
                      {getFieldDecorator('tenantId', {})(<Lov code="HPFM.TENANT" />)}
                    </Form.Item>
                  </Col>
                )}
                <Col span={8}>
                  <Form.Item
                    label={intl.get('hpfm.ruleEngine.model.ruleEngine.scriptCode').d('脚本编码')}
                    {...formlayout}
                  >
                    {getFieldDecorator('scriptCode', {})(
                      <Input typeCase="upper" trim inputChinese={false} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('hpfm.ruleEngine.model.ruleEngine.category').d('脚本分类')}
                    {...formlayout}
                  >
                    {getFieldDecorator('category')(
                      <Select allowClear>
                        {categoryList.map(item => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('hpfm.ruleEngine.model.ruleEngine.scriptDescription').d('描述')}
                    {...formlayout}
                  >
                    {getFieldDecorator('scriptDescription', {})(<Input />)}
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
