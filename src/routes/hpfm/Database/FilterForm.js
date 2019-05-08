import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import intl from 'utils/intl';

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
  handleFetch() {
    const { onSearch, form, storeFormValues } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          // 如果验证成功,则执行search
          onSearch();
          storeFormValues(values);
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
    const { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Form layout="inline">
          <Form.Item label={intl.get('hpfm.database.model.database.databaseCode').d('数据库代码')}>
            {getFieldDecorator('databaseCode', { required: true })(
              <Input typeCase="upper" trim inputChinese={false} />
            )}
          </Form.Item>
          <Form.Item label={intl.get('hpfm.database.model.database.datasourceId').d('数据源代码')}>
            {getFieldDecorator('datasourceId', {})(
              <Lov code="HPFM.DATASOURCE" queryParams={{ dsPurposeCode: 'DT' }} />
            )}
          </Form.Item>
          <Form.Item label={intl.get('hpfm.database.model.database.databaseName').d('数据库名称')}>
            {getFieldDecorator('databaseName', {})(<Input />)}
          </Form.Item>
          <Form.Item>
            <Button data-code="search" type="primary" htmlType="submit" onClick={this.handleFetch}>
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
            <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              {intl.get('hzero.common.status.reset').d('重置')}
            </Button>
          </Form.Item>
        </Form>
      </React.Fragment>
    );
  }
}
