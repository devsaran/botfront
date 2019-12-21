import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-autosize-textarea';
import QuickReplies from './QuickReplies';
import FloatingIconButton from '../../common/FloatingIconButton';


const BotResponseContainer = (props) => {
    const {
        value, onDelete, onChange, deletable, focus, onFocus,
    } = props;

    const [input, setInput] = useState();
    const [shiftPressed, setshiftPressed] = useState(false);
    const focusGrabber = useRef();
    const isTextResponse = value.__typename === 'TextPayload';
    const hasText = Object.keys(value).includes('text');
    const hasButtons = Object.keys(value).includes('buttons');

    const unformatNewlines = (response) => {
        if (!response) return response;
        return response.replace(/ {2}\n/g, '\n');
    };

    const formatNewlines = text => text.replace(/\n/g, '  \n');

    useEffect(() => {
        setInput(unformatNewlines(value.text));
        if (focus && focusGrabber.current) focusGrabber.current.focus();
    }, [value, focus]);


    function handleTextBlur() {
        if (isTextResponse) onChange({ text: formatNewlines(input) }, false);
        if (hasButtons) onChange({ text: formatNewlines(input), buttons: value.buttons }, false);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Shift') {
            setshiftPressed(true);
        }
        if (e.key === 'Backspace' && !input && deletable) {
            e.preventDefault();
            onDelete();
        }
        if (e.key === 'Enter' && isTextResponse) {
            if (shiftPressed) {
                return;
            }
            e.preventDefault();
            onChange({ text: formatNewlines(input) }, true);
        }
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Shift') {
            setshiftPressed(false);
        }
    };

    const renderText = () => (
        <TextareaAutosize
            ref={focusGrabber}
            placeholder='Type a message'
            role='button'
            tabIndex={0}
            value={input}
            onChange={(event) => {
                setInput(event.target.value);
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onFocus={() => onFocus()}
            onBlur={handleTextBlur}
        />
    );

    const renderButtons = () => (
        <QuickReplies
            value={value.buttons}
            onChange={(newButtons) => {
                onChange({ buttons: newButtons, text: value.text }, false);
            }}
        />
    );

    return (
        <div
            className='utterance-container bot-response'
            agent='bot'
            data-cy='bot-response-input'
        >
            <div className='inner'>
                {hasText && renderText()}
                {hasButtons && renderButtons()}
            </div>
            {deletable && <FloatingIconButton icon='trash' onClick={() => onDelete()} />}
        </div>
    );
};

BotResponseContainer.propTypes = {
    deletable: PropTypes.bool,
    value: PropTypes.object.isRequired,
    focus: PropTypes.bool,
    onFocus: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

BotResponseContainer.defaultProps = {
    deletable: true,
    focus: false,
};

export default BotResponseContainer;
