import React from 'react';

function Journey() {
    return (
        <section className="journey-section">
            <h2>The Complete Agricultural Journey</h2>
            <p>From soil to harvest - Master every step of modern farming with detailed insights, best practices, and expert techniques. Click on each step to learn more!</p>
            <hr className="underline"></hr>
            <a href="/journey" target="_blank" rel="noopener noreferrer" className="journey-btn">
                <i className="fa-solid fa-seedling"></i> View Agricultural Timeline
            </a>
        </section>
    );
}

export default Journey;
