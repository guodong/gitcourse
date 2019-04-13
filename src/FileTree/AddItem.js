import React from 'react';
import styled from 'styled-components';
import {inject, observer} from "mobx-react/index";
import IconFolder from 'react-icons/lib/fa/folder';
import IconFile from 'react-icons/lib/fa/file';

const Container = styled.div`
  
`;

const FileContainer = styled.div`
  padding: 0.4rem 3rem 0.4rem calc(1rem - 2px);
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  color: #ccc;
  background: ${props => props.active ? 'rgba(139,191,228,0.2)' : 'inherit'};
  padding-left: ${props => 20 + props.depth * 20 + 'px'};
  border-left: 2px solid ${props => props.active ? '#fff' : 'inherit'};
  &:hover {
    background: rgba(108,174,221,0.1);
  }
`;

const AddItem = inject('store')(
  observer(({file, store}) => {
    const handleChange = (event) => {
      file.setAddName(event.target.value)
    };

    const handleOnBlue = (event) => {
      if (event.target.value !== '') {
        file.mkdir(file.path + event.target.value);
      }
      file.setAdd('');
    };

    const show = () => {
      if (file.add === 'fold') {
        // ReactDOM.findDOMNode(this.refs.input).focus();
        return (
          <FileContainer depth={file.depth}>
            <IconFolder style={{marginRight: '5px'}}/><input onblur={handleOnBlue} ref='foldInput'
                                                             className='add-item-input' type='text' value={file.addName}
                                                             onChange={handleChange}/>
          </FileContainer>
        )
      } else if (file.add === 'file') {
        return (
          <FileContainer depth={file.depth}>
            <IconFile style={{marginRight: '5px'}}/><input ref='fileInput' className='add-item-input' type='text'
                                                           value={file.addName} onChange={handleChange}/>
          </FileContainer>)
      }
    };
    return (
      <div>
        <Container active={false}>
          {show()}
        </Container>
      </div>
    )
  })
);

export default AddItem;