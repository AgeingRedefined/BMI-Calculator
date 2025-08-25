// BMI Calculator Application
class BMICalculator {
    constructor() {
        this.currentUnit = 'metric';
        this.debounceTimer = null;
        this.ageBasedRanges = {
            under_40: {
                underweight: { min: 0, max: 18.5, description: "Underweight" },
                normal: { min: 18.5, max: 24.9, description: "Normal weight" },
                overweight: { min: 25.0, max: 29.9, description: "Overweight" },
                obese_1: { min: 30.0, max: 34.9, description: "Obese Class I" },
                obese_2: { min: 35.0, max: 39.9, description: "Obese Class II" },
                obese_3: { min: 40.0, max: 100, description: "Obese Class III" }
            },
            "40_to_65": {
                underweight: { min: 0, max: 20.0, description: "Underweight" },
                normal: { min: 20.0, max: 25.0, description: "Normal weight" },
                overweight: { min: 25.0, max: 29.9, description: "Overweight" },
                obese_1: { min: 30.0, max: 34.9, description: "Obese Class I" },
                obese_2: { min: 35.0, max: 39.9, description: "Obese Class II" },
                obese_3: { min: 40.0, max: 100, description: "Obese Class III" }
            },
            over_65: {
                underweight: { min: 0, max: 23.0, description: "Underweight" },
                normal: { min: 23.0, max: 27.0, description: "Normal weight" },
                overweight: { min: 27.0, max: 29.9, description: "Overweight" },
                obese_1: { min: 30.0, max: 34.9, description: "Obese Class I" },
                obese_2: { min: 35.0, max: 39.9, description: "Obese Class II" },
                obese_3: { min: 40.0, max: 100, description: "Obese Class III" }
            }
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUnitLabels();
        this.toggleHeightInputs();
    }

    bindEvents() {
        // Unit toggle buttons
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleUnitToggle(e));
        });

        // Form submission
        document.getElementById('bmiForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateBMI();
        });

        // Real-time calculation on input
        const inputs = ['age', 'heightCm', 'heightFt', 'heightIn', 'weight'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.clearFieldError(element);
                    this.debouncedCalculation();
                });
                element.addEventListener('blur', () => this.validateField(element));
            }
        });

        // Reset button
        document.querySelector('.reset-btn').addEventListener('click', () => this.resetForm());
    }

    handleUnitToggle(event) {
        const newUnit = event.target.dataset.unit;
        if (newUnit === this.currentUnit) return;

        // Convert existing values if any
        this.convertValues(this.currentUnit, newUnit);
        
        // Update current unit
        this.currentUnit = newUnit;
        
        // Update UI
        this.updateUnitButtons();
        this.updateUnitLabels();
        this.toggleHeightInputs();
        
        // Clear any existing validation errors
        this.clearAllErrors();
        
        // Recalculate if we have values
        this.debouncedCalculation();
    }

    convertValues(fromUnit, toUnit) {
        const weightInput = document.getElementById('weight');
        const heightCmInput = document.getElementById('heightCm');
        const heightFtInput = document.getElementById('heightFt');
        const heightInInput = document.getElementById('heightIn');

        if (fromUnit === 'metric' && toUnit === 'imperial') {
            // Convert weight from kg to lbs
            if (weightInput.value && weightInput.value.trim() !== '') {
                const lbs = parseFloat(weightInput.value) * 2.20462;
                weightInput.value = Math.round(lbs * 10) / 10;
            }
            
            // Convert height from cm to ft/in
            if (heightCmInput.value && heightCmInput.value.trim() !== '') {
                const totalInches = parseFloat(heightCmInput.value) * 0.393701;
                const feet = Math.floor(totalInches / 12);
                const inches = Math.round(totalInches % 12);
                heightFtInput.value = feet;
                heightInInput.value = inches;
            }
        } else if (fromUnit === 'imperial' && toUnit === 'metric') {
            // Convert weight from lbs to kg
            if (weightInput.value && weightInput.value.trim() !== '') {
                const kg = parseFloat(weightInput.value) * 0.453592;
                weightInput.value = Math.round(kg * 10) / 10;
            }
            
            // Convert height from ft/in to cm
            if ((heightFtInput.value && heightFtInput.value.trim() !== '') || 
                (heightInInput.value && heightInInput.value.trim() !== '')) {
                const feet = parseFloat(heightFtInput.value) || 0;
                const inches = parseFloat(heightInInput.value) || 0;
                const totalInches = (feet * 12) + inches;
                const cm = totalInches * 2.54;
                heightCmInput.value = Math.round(cm * 10) / 10;
            }
        }
    }

    updateUnitButtons() {
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === this.currentUnit);
        });
    }

    updateUnitLabels() {
        const weightLabel = document.querySelector('.weight-label');
        const weightInput = document.getElementById('weight');
        
        if (this.currentUnit === 'metric') {
            weightLabel.textContent = 'Weight (kg)';
            weightInput.placeholder = '70';
            weightInput.min = '20';
            weightInput.max = '500';
        } else {
            weightLabel.textContent = 'Weight (lbs)';
            weightInput.placeholder = '154';
            weightInput.min = '44';
            weightInput.max = '1100';
        }
    }

    toggleHeightInputs() {
        const metricInput = document.querySelector('.metric-input');
        const imperialInputs = document.querySelector('.imperial-inputs');
        
        if (this.currentUnit === 'metric') {
            metricInput.classList.remove('hidden');
            imperialInputs.classList.add('hidden');
            
            // Clear imperial values when switching to metric
            document.getElementById('heightFt').value = '';
            document.getElementById('heightIn').value = '';
        } else {
            metricInput.classList.add('hidden');
            imperialInputs.classList.remove('hidden');
            
            // Clear metric value when switching to imperial
            document.getElementById('heightCm').value = '';
        }
    }

    clearFieldError(element) {
        element.classList.remove('error');
        const errorId = this.getErrorElementId(element.id);
        if (errorId) {
            document.getElementById(errorId).textContent = '';
        }
    }

    clearAllErrors() {
        document.querySelectorAll('.form-control').forEach(el => {
            el.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
    }

    getErrorElementId(fieldId) {
        const errorMap = {
            'age': 'ageError',
            'heightCm': 'heightError',
            'heightFt': 'heightImperialError',
            'heightIn': 'heightImperialError',
            'weight': 'weightError'
        };
        return errorMap[fieldId];
    }

    debouncedCalculation() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            if (this.hasRequiredValues()) {
                this.calculateBMI();
            }
        }, 500);
    }

    hasRequiredValues() {
        const age = document.getElementById('age').value;
        const weight = document.getElementById('weight').value;
        let hasHeight = false;

        if (this.currentUnit === 'metric') {
            hasHeight = document.getElementById('heightCm').value;
        } else {
            const feet = document.getElementById('heightFt').value;
            const inches = document.getElementById('heightIn').value;
            hasHeight = feet && inches !== undefined; // Allow 0 inches
        }

        return age && weight && hasHeight;
    }

    validateField(element) {
        const value = parseFloat(element.value);
        let errorMessage = '';
        let isValid = true;

        // Skip validation if field is empty (not required for real-time validation)
        if (!element.value || element.value.trim() === '') {
            this.clearFieldError(element);
            return true;
        }

        const min = parseFloat(element.min);
        const max = parseFloat(element.max);

        switch (element.id) {
            case 'age':
                if (isNaN(value) || value < 1 || value > 120) {
                    errorMessage = 'Please enter a valid age between 1 and 120 years';
                    isValid = false;
                }
                break;
            case 'heightCm':
                if (isNaN(value) || value < min || value > max) {
                    errorMessage = 'Please enter a valid height between 50 and 300 cm';
                    isValid = false;
                }
                break;
            case 'heightFt':
                if (isNaN(value) || value < 3 || value > 8) {
                    errorMessage = 'Please enter a valid height between 3 and 8 feet';
                    isValid = false;
                }
                break;
            case 'heightIn':
                if (isNaN(value) || value < 0 || value > 11) {
                    errorMessage = 'Inches must be between 0 and 11';
                    isValid = false;
                }
                break;
            case 'weight':
                if (isNaN(value) || value < min || value > max) {
                    const unit = this.currentUnit === 'metric' ? 'kg' : 'lbs';
                    errorMessage = `Please enter a valid weight between ${min} and ${max} ${unit}`;
                    isValid = false;
                }
                break;
        }

        const errorElementId = this.getErrorElementId(element.id);
        const errorEl = document.getElementById(errorElementId);
        
        if (!isValid) {
            element.classList.add('error');
            errorEl.textContent = errorMessage;
        } else {
            element.classList.remove('error');
            errorEl.textContent = '';
        }

        return isValid;
    }

    validateAllFieldsForCalculation() {
        const age = document.getElementById('age');
        const weight = document.getElementById('weight');
        
        let isValid = true;

        // Validate age
        if (!age.value || !this.validateField(age)) {
            isValid = false;
        }

        // Validate weight
        if (!weight.value || !this.validateField(weight)) {
            isValid = false;
        }

        // Validate height based on current unit
        if (this.currentUnit === 'metric') {
            const heightCm = document.getElementById('heightCm');
            if (!heightCm.value || !this.validateField(heightCm)) {
                isValid = false;
            }
        } else {
            const heightFt = document.getElementById('heightFt');
            const heightIn = document.getElementById('heightIn');
            
            if (!heightFt.value) {
                heightFt.classList.add('error');
                document.getElementById('heightImperialError').textContent = 'Please enter feet and inches';
                isValid = false;
            } else {
                this.validateField(heightFt);
            }
            
            if (heightIn.value === '' || heightIn.value === null) {
                heightIn.classList.add('error');
                document.getElementById('heightImperialError').textContent = 'Please enter feet and inches';
                isValid = false;
            } else {
                this.validateField(heightIn);
            }
        }

        return isValid;
    }

    calculateBMI() {
        if (!this.validateAllFieldsForCalculation()) {
            return;
        }

        const age = parseFloat(document.getElementById('age').value);
        const weight = parseFloat(document.getElementById('weight').value);
        let heightInMeters;

        // Get height in meters
        if (this.currentUnit === 'metric') {
            const heightCm = parseFloat(document.getElementById('heightCm').value);
            heightInMeters = heightCm / 100;
        } else {
            const heightFt = parseFloat(document.getElementById('heightFt').value);
            const heightIn = parseFloat(document.getElementById('heightIn').value) || 0;
            const totalInches = (heightFt * 12) + heightIn;
            heightInMeters = totalInches * 0.0254;
        }

        // Calculate BMI
        let bmi;
        if (this.currentUnit === 'metric') {
            bmi = weight / (heightInMeters * heightInMeters);
        } else {
            const totalInches = heightInMeters / 0.0254;
            bmi = (weight / (totalInches * totalInches)) * 703;
        }

        // Display results
        this.displayResults(bmi, age);
    }

    displayResults(bmi, age) {
        const bmiValue = Math.round(bmi * 10) / 10;
        const ranges = this.getAgeBasedRanges(age);
        const category = this.getBMICategory(bmi, ranges);
        
        // Update BMI value
        document.getElementById('bmiValue').textContent = bmiValue.toFixed(1);
        
        // Update category
        const categoryElement = document.getElementById('bmiCategory');
        categoryElement.textContent = category.description;
        categoryElement.className = `bmi-category ${category.class}`;
        
        // Update range indicator
        this.updateRangeIndicator(bmi, ranges);
        
        // Update age info
        this.updateAgeInfo(age, ranges);
        
        // Show results
        const resultsContainer = document.getElementById('results');
        resultsContainer.classList.remove('hidden');
        
        // Scroll to results on mobile
        if (window.innerWidth < 768) {
            setTimeout(() => {
                resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }

    getAgeBasedRanges(age) {
        if (age < 40) {
            return this.ageBasedRanges.under_40;
        } else if (age >= 40 && age <= 65) {
            return this.ageBasedRanges["40_to_65"];
        } else {
            return this.ageBasedRanges.over_65;
        }
    }

    getBMICategory(bmi, ranges) {
        for (const [key, range] of Object.entries(ranges)) {
            if (bmi >= range.min && (bmi < range.max || (key.includes('obese_3') && bmi >= range.min))) {
                let className = '';
                if (key === 'underweight') className = 'underweight';
                else if (key === 'normal') className = 'normal';
                else if (key === 'overweight') className = 'overweight';
                else className = 'obese';
                
                return {
                    description: range.description,
                    class: className,
                    key: key
                };
            }
        }
        
        return { description: 'Unknown', class: 'unknown', key: 'unknown' };
    }

    updateRangeIndicator(bmi, ranges) {
        const marker = document.getElementById('bmiMarker');
        
        // Calculate position based on BMI value (simplified visualization)
        let position = 0;
        const maxBmi = 40; // For visualization purposes
        
        if (bmi <= ranges.underweight.max) {
            position = (bmi / ranges.underweight.max) * 20;
        } else if (bmi <= ranges.normal.max) {
            position = 20 + ((bmi - ranges.normal.min) / (ranges.normal.max - ranges.normal.min)) * 30;
        } else if (bmi <= ranges.overweight.max) {
            position = 50 + ((bmi - ranges.overweight.min) / (ranges.overweight.max - ranges.overweight.min)) * 25;
        } else {
            position = 75 + ((Math.min(bmi, maxBmi) - 30) / (maxBmi - 30)) * 25;
        }
        
        marker.style.left = Math.min(Math.max(position, 0), 100) + '%';
    }

    updateAgeInfo(age, ranges) {
        const ageInfo = document.getElementById('ageInfo');
        const rangesList = document.getElementById('rangesList');
        
        let ageGroup = '';
        if (age < 40) {
            ageGroup = 'Under 40 years (Standard ranges)';
        } else if (age >= 40 && age <= 65) {
            ageGroup = '40-65 years (Adjusted ranges)';
        } else {
            ageGroup = 'Over 65 years (Senior ranges)';
        }
        
        ageInfo.querySelector('p').innerHTML = `<strong>Age Group:</strong> ${ageGroup}`;
        
        // Create ranges list
        rangesList.innerHTML = '';
        Object.entries(ranges).forEach(([key, range]) => {
            const item = document.createElement('div');
            item.className = 'range-item';
            
            const label = document.createElement('span');
            label.className = 'range-label';
            label.textContent = range.description;
            
            const value = document.createElement('span');
            value.className = 'range-value';
            if (key.includes('obese_3')) {
                value.textContent = `${range.min}+`;
            } else {
                value.textContent = `${range.min} - ${range.max}`;
            }
            
            item.appendChild(label);
            item.appendChild(value);
            rangesList.appendChild(item);
        });
    }

    resetForm() {
        // Clear all form fields
        document.getElementById('bmiForm').reset();
        
        // Clear all error messages and classes
        this.clearAllErrors();
        
        // Hide results
        document.getElementById('results').classList.add('hidden');
        
        // Reset to metric units
        this.currentUnit = 'metric';
        this.updateUnitButtons();
        this.updateUnitLabels();
        this.toggleHeightInputs();
        
        // Focus on first input
        document.getElementById('age').focus();
    }
}

// Initialize the BMI Calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BMICalculator();
});

// Add some utility functions for better UX
document.addEventListener('keydown', (e) => {
    // Allow Enter key to submit form
    if (e.key === 'Enter' && e.target.matches('.form-control')) {
        e.preventDefault();
        const form = e.target.closest('form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});

// Prevent negative values and invalid characters in number inputs
document.addEventListener('input', (e) => {
    if (e.target.type === 'number') {
        let value = e.target.value;
        
        // Remove any non-numeric characters except decimal point
        value = value.replace(/[^0-9.]/g, '');
        
        // Ensure only one decimal point
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        e.target.value = value;
    }
});