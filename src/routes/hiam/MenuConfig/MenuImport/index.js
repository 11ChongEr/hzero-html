import React, { PureComponent } from 'react';
import { Form, Button, Upload, Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import Drawer from '../Drawer';
import styles from './index.less';

const FormItem = Form.Item;

const viewMessagePrompt = 'hiam.menuConfig.view.message';

export default class MenuImport extends PureComponent {
  state = {
    fileList: [],
  };

  import() {
    const { handleImport } = this.props;
    const { fileList } = this.state;
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('customMenuFiles', file);
    });
    handleImport(formData);
  }

  onRemove(file) {
    const { fileList } = this.state;
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    this.setState({
      fileList: newFileList,
    });
  }

  cancel() {
    const { onCancel = e => e } = this.props;
    this.setState({
      fileList: [],
    });
    onCancel();
  }

  render() {
    const { visible, importing } = this.props;
    const drawerProps = {
      title: intl.get(`${viewMessagePrompt}.title.importMenu`).d('导入客户化菜单'),
      visible,
      anchor: 'right',
      onCancel: this.cancel.bind(this),
      footer: null,
    };
    const uploadProps = {
      name: 'customMenuFiles',
      multiple: true,
      accept: '.yaml',
      beforeUpload: file => {
        this.setState(({ fileList = [] }) => {
          let newFileList = fileList;

          if (newFileList.length !== 3) {
            newFileList = isEmpty(fileList.filter(o => o.name === file.name))
              ? fileList.concat(file)
              : newFileList.map(n => (n.name === file.name ? file : n));
          }
          return {
            fileList: newFileList,
          };
        });
        return false;
      },
      fileList: this.state.fileList,
      onRemove: this.onRemove.bind(this),
    };
    return (
      <Drawer {...drawerProps}>
        <Content
          description={
            <div className={styles['hiam-menu-import-description']}>
              {intl
                .get(`${viewMessagePrompt}.description.importMenu0`)
                .d('请提供如下三份菜单元数据文件进行客户化扩展菜单导入：')}
              <ul>
                <li>
                  {intl
                    .get(`${viewMessagePrompt}.description.importMenu1`)
                    .d('1. menu.yaml：菜单结构化数据：')}
                </li>
                <li>
                  {intl
                    .get(`${viewMessagePrompt}.description.importMenu2`)
                    .d('2. language.zh.yaml：中文菜单资源')}
                </li>
                <li>
                  {intl
                    .get(`${viewMessagePrompt}.description.importMenu3`)
                    .d('3. language.en.yaml：英文菜单资源')}
                </li>
              </ul>
            </div>
          }
        >
          <Form className={styles['hiam-menu-import-form']}>
            <FormItem>
              <Upload {...uploadProps}>
                <Button disabled={this.state.fileList.length === 3}>
                  <Icon type="upload" /> 选择文件
                </Button>
              </Upload>
              <Button
                type="primary"
                onClick={this.import.bind(this)}
                disabled={this.state.fileList.length === 0}
                loading={importing}
              >
                {importing
                  ? intl.get(`${viewMessagePrompt}.button.importing`).d('导入中...')
                  : intl.get(`${viewMessagePrompt}.button.startImporting`).d('开始导入')}
              </Button>
            </FormItem>
          </Form>
        </Content>
      </Drawer>
    );
  }
}
