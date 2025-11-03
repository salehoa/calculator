// متغيرات الحاسبة
let currentExpression = '';
let displayValue = '0';
let history = [];
let chart = null;

// تحديث الشاشة
function updateDisplay() {
    document.getElementById('display').textContent = displayValue;
    document.getElementById('expression').textContent = currentExpression || ' ';
}

// إضافة إلى التعبير
function addToExpression(value) {
    if (displayValue === '0' && value !== '.') {
        currentExpression = value;
        displayValue = value;
    } else {
        currentExpression += value;
        displayValue = currentExpression;
    }
    updateDisplay();
}

// إضافة دالة
function addFunction(func) {
    if (displayValue === '0') {
        currentExpression = func;
        displayValue = func;
    } else {
        currentExpression += func;
        displayValue = currentExpression;
    }
    updateDisplay();
}

// مسح الشاشة
function clearDisplay() {
    currentExpression = '';
    displayValue = '0';
    updateDisplay();
}

// حذف آخر حرف
function deleteLastChar() {
    if (currentExpression.length > 0) {
        currentExpression = currentExpression.slice(0, -1);
        displayValue = currentExpression || '0';
        updateDisplay();
    }
}

// حساب النتيجة
function calculate() {
    if (!currentExpression) return;
    
    try {
        // استبدال الرموز
        let expression = currentExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/√/g, 'sqrt')
            .replace(/π/g, 'pi')
            .replace(/ln\(/g, 'log(')
            .replace(/log\(/g, 'log10(')
            .replace(/\^/g, '^');

        // حساب النتيجة باستخدام math.js
        const result = math.evaluate(expression);
        
        // تنسيق النتيجة
        const formattedResult = typeof result === 'number' 
            ? (Math.abs(result) < 0.0001 || Math.abs(result) > 1000000 
                ? result.toExponential(6) 
                : result.toString())
            : result.toString();

        // إضافة إلى السجل
        addToHistory(currentExpression, formattedResult);

        // تحديث الشاشة
        displayValue = formattedResult;
        currentExpression = formattedResult;
        updateDisplay();
    } catch (error) {
        displayValue = 'خطأ';
        updateDisplay();
        setTimeout(() => {
            displayValue = '0';
            currentExpression = '';
            updateDisplay();
        }, 1500);
    }
}

// إضافة إلى السجل
function addToHistory(expression, result) {
    history.unshift({ expression, result, time: new Date().toLocaleTimeString('ar-SA') });
    if (history.length > 20) history.pop();
    updateHistory();
}

// تحديث عرض السجل
function updateHistory() {
    const historyDiv = document.getElementById('history');
    if (history.length === 0) {
        historyDiv.innerHTML = '<p class="text-gray-500 text-center text-sm">لا توجد عمليات بعد</p>';
        return;
    }

    historyDiv.innerHTML = history.map(item => `
        <div class="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
             onclick="loadFromHistory('${item.result}')">
            <div class="text-gray-600 text-sm mb-1">${item.expression}</div>
            <div class="text-gray-900 font-bold text-lg">= ${item.result}</div>
            <div class="text-gray-400 text-xs mt-1">${item.time}</div>
        </div>
    `).join('');
}

// تحميل من السجل
function loadFromHistory(value) {
    currentExpression = value;
    displayValue = value;
    updateDisplay();
}

// مسح السجل
function clearHistory() {
    if (confirm('هل تريد مسح جميع العمليات من السجل؟')) {
        history = [];
        updateHistory();
    }
}

// التبديل بين التبويبات
function switchTab(tab) {
    // تحديث أزرار التبويبات
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`tab-${tab}`).classList.add('active');

    // تحديث المحتوى
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`content-${tab}`).classList.remove('hidden');
}

// تعيين دالة في حقل الإدخال
function setFunction(func) {
    document.getElementById('function-input').value = func;
}

// رسم الدالة
function plotFunction() {
    const functionInput = document.getElementById('function-input').value;
    const xMin = parseFloat(document.getElementById('x-min').value);
    const xMax = parseFloat(document.getElementById('x-max').value);

    if (!functionInput) {
        alert('الرجاء إدخال دالة');
        return;
    }

    if (xMin >= xMax) {
        alert('يجب أن تكون قيمة "من" أصغر من قيمة "إلى"');
        return;
    }

    try {
        // إنشاء نقاط البيانات
        const points = 500;
        const step = (xMax - xMin) / points;
        const xValues = [];
        const yValues = [];

        // تحويل الدالة إلى تعبير math.js
        let expression = functionInput
            .replace(/π/g, 'pi')
            .replace(/√/g, 'sqrt')
            .replace(/ln\(/g, 'log(')
            .replace(/log\(/g, 'log10(')
            .replace(/\^/g, '^');

        // حساب القيم
        for (let i = 0; i <= points; i++) {
            const x = xMin + (i * step);
            xValues.push(x);

            try {
                const y = math.evaluate(expression, { x: x });
                // تصفية القيم غير الصحيحة
                if (isFinite(y) && !isNaN(y) && Math.abs(y) < 1e10) {
                    yValues.push(y);
                } else {
                    yValues.push(null);
                }
            } catch (e) {
                yValues.push(null);
            }
        }

        // رسم البياني
        drawChart(xValues, yValues, functionInput);

    } catch (error) {
        alert('خطأ في الدالة: ' + error.message);
    }
}

// رسم الرسم البياني
function drawChart(xValues, yValues, functionName) {
    const ctx = document.getElementById('graph-canvas').getContext('2d');

    // حذف الرسم السابق
    if (chart) {
        chart.destroy();
    }

    // إنشاء رسم بياني جديد
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues.map(x => x.toFixed(2)),
            datasets: [{
                label: `f(x) = ${functionName}`,
                data: yValues,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1,
                spanGaps: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            family: 'Arial'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'الرسم البياني للدالة',
                    font: {
                        size: 18,
                        family: 'Arial'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function(context) {
                            return 'x = ' + context[0].label;
                        },
                        label: function(context) {
                            return 'y = ' + (context.parsed.y !== null ? context.parsed.y.toFixed(4) : 'غير معرف');
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'المحور السيني (x)',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        maxTicksLimit: 10,
                        callback: function(value, index, values) {
                            return parseFloat(this.getLabelForValue(value)).toFixed(1);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'المحور الصادي (y)',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        maxTicksLimit: 10,
                        callback: function(value) {
                            return value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// دعم لوحة المفاتيح
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
        addToExpression(key);
    } else if (key === '.') {
        addToExpression('.');
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        addToExpression(key);
    } else if (key === 'Enter') {
        event.preventDefault();
        calculate();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === 'Backspace') {
        event.preventDefault();
        deleteLastChar();
    }
});

// تهيئة الحاسبة عند التحميل
updateDisplay();
updateHistory();
