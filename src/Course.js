import React, {Component} from 'react';
import './App.css';
import {Layout, Menu, Card, Icon, Col, Row, List, Button} from 'antd';
import {inject, observer} from "mobx-react";
import {Link, Router} from "react-router-dom";
import {getPath} from "mobx-state-tree";

const {Header, Content, Footer} = Layout;
const gridStyle = {
  width: '25%',
  textAlign: 'left',
  cursor: 'pointer'
};

class Course extends Component {
  render() {
    return (
      <div style={{padding: 50}}>
        <Row gutter={16}>
          <Col span={18}>
            <Card style={{marginBottom: 30}}>
              <h1>{this.props.store.course.title}</h1>
              {this.props.store.course.description}
            </Card>
            <Card title='课程列表' style={{marginBottom: 30}}>
              <List itemLayout="horizontal">

                {this.props.store.course.scenarios.map(s =>
                  <List.Item key={s}>
                    <List.Item.Meta
                      avatar={<Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" style={{fontSize: 32}}/>}
                      title={s.title}
                      description={'共 ' + s.steps.length + ' 个步骤'}
                    />
                    <Link to={'/scenario' + window.location.hash}><Button type='primary'
                                                                              onClick={() => this.props.store.setCurrentScenario(s)}>开始学习</Button></Link>
                  </List.Item>
                )}
              </List>

            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <a class="github-button" href={this.props.store.repo.substr(0, this.props.store.repo.length - 4)}
                 data-size="large" data-show-count="true"
                 aria-label="Star git/git on GitHub">Star</a>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default inject('store')(observer(Course));
