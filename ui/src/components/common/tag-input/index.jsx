import React, {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import classnames from 'classnames';
import {Button, Col, Row} from "react-bootstrap";
import {useCopyToClipboard} from "usehooks-ts";
import _ from "lodash";

export const Cancel = ({
  cancelProps,
  ...rest
}) => {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' {...rest}>
      <path d='M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z' {...cancelProps} />
    </svg>
  );
};

export const InputTags = ({
  placeholder,
  values = [],
  onTags,
  name,
  copyFeature = false,
  className = 'form-control',
  elementClassName = 'badge bg-primary',
  cancelProps,
  ...rest
}) => {
  const [terms, setTerms] = useState(values);
  const [value, setValue] = useState('');
  const [focusIndex, setFocusIndex] = useState(-1);
  const inputRef = useRef(null);
  const [copiedValue, copy] = useCopyToClipboard();

  const forceInputFocus = () => {
    if (inputRef.current && focusIndex === -1) {
      inputRef.current.focus();
    }
  };

  useLayoutEffect(() => {
    if (terms) {
      if (terms.length === 0) {
        setFocusIndex(-1);
      }
      onTags(terms);
    }
  }, [terms?.length]);

  useEffect(() => {
    if (!_.isEqual(values, terms)) {
      setTerms(values || []);
    }
  }, [values]);

  useEffect(() => {
    forceInputFocus();
  }, [focusIndex, inputRef.current]);

  const onchange = (event) => {
    setValue(event.currentTarget.value);
  };

  const possibleAddKeys = ['Enter', ' ', 'Tab', ','];

  const onkeydown = (event) => {
    const { key } = event;
    const currentValue = value.trim();
    if (possibleAddKeys.includes(key) && currentValue) {
      event.preventDefault();
      setTerms([...terms, currentValue.replace(',', '')]);
      setValue('');
      setFocusIndex(-1);
    }
  };

  const onkeyup = (event) => {
    const { key } = event;
    const currentValue = value.trim();
    const valueLength = currentValue.length;
    const currentTarget = event.currentTarget.selectionEnd || 0;
    const isEndOfText = currentTarget > valueLength;
    const isStartOfText = currentTarget === 0;
    const isPossibleTermsMove = terms.length > 0;
    const isPossibleAddKeys = possibleAddKeys.includes(key);

    if (isPossibleAddKeys && currentValue) {
      event.preventDefault();
      setTerms([...terms, currentValue.replace(',', '')]);
      setValue('');
      setFocusIndex(-1);
    } else if (
      isStartOfText &&
      (key === 'Backspace' || key === 'ArrowLeft') &&
      isPossibleTermsMove
    ) {
      event.preventDefault();
      setFocusIndex(terms.length - 1);
    } else if (isEndOfText && key === 'ArrowRight' && isPossibleTermsMove) {
      event.preventDefault();
      setFocusIndex(0);
    }
  };

  const handleBlur = () => {
    const trimmed = value.trim();
    if (trimmed) {
      // Delay to allow any internal component interactions to complete
      setTimeout(() => {
        setTerms((prev) => [...prev, trimmed]);
        setValue('');
        setFocusIndex(-1);
      }, 100);
    }
  };

  const handleRemove = (index, focus) => {
    setTerms(terms.filter((_, i) => i !== index));
    if (focus) {
      setFocusIndex(Math.max(focusIndex - 1, 0));
    } else {
      forceInputFocus();
    }
  };

  const setSelectedIndex = (index) => {
    if (index < terms.length && index > -1) {
      setFocusIndex(index);
    } else {
      setFocusIndex(-1);
    }
  };

  return (
    <div className='form-control h-auto flex-wrap'>
      <Row>
        <Col xs={12}>
          <div style={{display: 'block', marginBottom: '0.5rem'}}>
            {terms.map((item, index) => {
              const focus = focusIndex === index;
              return (
                <Element
                  key={`${item}${index}`}
                  value={item}
                  index={index}
                  onRemove={handleRemove}
                  focus={focus}
                  onSelectedIndex={setSelectedIndex}
                  className={elementClassName}
                />
              );
            })}
          </div>
        </Col>
        <Col xs={12} style={{ marginBottom: '0.5rem' }}>
          <Fragment>
            <input
              data-testid='input-tags'
              ref={inputRef}
              type='text'
              className={classnames(
                'border-0 input-tags me-2',
                className
              )}
              placeholder={placeholder}
              aria-label={placeholder}
              value={value}
              onChange={onchange}
              onKeyUp={onkeyup}
              onKeyDown={onkeydown}
              onBlur={handleBlur}
              autoFocus
              name={name}
              {...rest}
            />
            { copyFeature ? <div className='align-content-center mt-2'>
              <Button variant='outline-secondary' size='sm' onClick={() => copy(terms.join(','))}>Copy</Button>
            </div> : null }
          </Fragment>
        </Col>
      </Row>
    </div>
  );
};

const Element = (props) => {
  const [focus, setFocus] = useState(false);
  const onclick = () => {
    props.onRemove(props.index, focus);
  };
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (ref.current && props.focus) {
      ref.current.focus();
    }
  }, [props.focus]);

  const onkeydown = (event) => {
    const {key} = event;
    event.preventDefault();
    if (key === 'Backspace' || key === 'Delete') {
      props.onRemove(props.index, props.focus);
    } else if (key === 'ArrowLeft') {
      props.onSelectedIndex(props.index - 1);
    } else if (key === 'ArrowRight') {
      props.onSelectedIndex(props.index + 1);
    }
  };
  return (
    <div
      data-testid='tag-element'
      ref={ref}
      tabIndex={0}
      className={classnames(
        'bg-gradient me-1 pe-1 justify-content-between mt-1',
        props.className
      )}
      onKeyUp={onkeydown}
      onFocus={() => {
        setFocus(true);
      }}
      onBlur={() => {
        setFocus(false);
      }}
    >
      <span>
        {props.value}
      </span>
      <button
        data-testid='tag-clean-element'
        aria-label='remove path fragment'
        tabIndex={-1}
        className='border-0 bg-transparent ps-auto pe-0'
        style={{ outline: 0, fill: 'var(--bs-white)', opacity: 1 }}
        onClick={onclick}
      >
        <Cancel
          style={{ fill: 'var(--bs-white)', opacity: 1 }}
          width={18}
          height={18}
        />
      </button>
    </div>
  );
};