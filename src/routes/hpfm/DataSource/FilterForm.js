import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
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
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
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

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('hpfm.dataSource.model.dataSource.datasourceCode')
                      .d('数据源编码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('datasourceCode')(
                      <Input typeCase="lower" trim inputChinese={false} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="数据源名称" {...formLayout}>
                    {getFieldDecorator('description')(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get('hpfm.dataSource.model.dataSource.remark').d('备注')}
                    {...formLayout}
                  >
                    {getFieldDecorator('remark')(<Input />)}
                  </Form.Item>
                </Col>
              </Row>
              {!isTenantRoleLevel() && (
                <Row>
                  <Col span={8}>
                    <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
                      {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.status.search').d('查询')}
                </Button>
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get('hzero.common.status.reset').d('重置')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
