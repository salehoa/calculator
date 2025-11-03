import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// خدمة الملفات الثابتة من المجلد public/static
app.use('/static/*', serveStatic({ root: './public' }))

// الصفحة الرئيسية
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>حاسبة علمية متقدمة</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/mathjs@12.2.1/lib/browser/math.min.js"></script>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .calculator-button {
                @apply bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition duration-200 text-lg;
            }
            .calculator-button:active {
                @apply transform scale-95;
            }
            .operator-button {
                @apply bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded transition duration-200 text-lg;
            }
            .function-button {
                @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded transition duration-200 text-sm;
            }
            .display {
                @apply bg-gray-800 text-white text-right p-4 rounded-lg mb-4 font-mono text-2xl min-h-[80px] break-all;
            }
            .tab-button {
                @apply px-6 py-3 rounded-t-lg font-semibold transition duration-200;
            }
            .tab-button.active {
                @apply bg-white text-gray-800 shadow-lg;
            }
            .tab-button:not(.active) {
                @apply bg-gray-700 text-gray-300 hover:bg-gray-600;
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen p-4">
        <div class="max-w-7xl mx-auto">
            <!-- العنوان -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-white mb-2">
                    <i class="fas fa-calculator mr-3"></i>
                    حاسبة علمية متقدمة
                </h1>
                <p class="text-gray-400">حاسبة متقدمة مع إمكانية رسم الدوال البيانية</p>
            </div>

            <!-- التبويبات -->
            <div class="flex gap-2 mb-0">
                <button onclick="switchTab('calculator')" id="tab-calculator" class="tab-button active">
                    <i class="fas fa-calculator ml-2"></i>
                    الحاسبة
                </button>
                <button onclick="switchTab('graph')" id="tab-graph" class="tab-button">
                    <i class="fas fa-chart-line ml-2"></i>
                    الرسوم البيانية
                </button>
            </div>

            <!-- المحتوى -->
            <div class="bg-white rounded-lg shadow-2xl p-6">
                <!-- تبويب الحاسبة -->
                <div id="content-calculator" class="tab-content">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- الحاسبة الرئيسية -->
                        <div class="lg:col-span-2">
                            <div class="bg-gray-900 rounded-lg p-6 shadow-xl">
                                <!-- الشاشة -->
                                <div class="display" id="display">0</div>
                                <div class="text-gray-400 text-sm text-right mb-4 h-6" id="expression"></div>

                                <!-- الأزرار -->
                                <div class="grid grid-cols-5 gap-2">
                                    <!-- الصف الأول - الدوال العلمية -->
                                    <button onclick="addFunction('sin(')" class="function-button">sin</button>
                                    <button onclick="addFunction('cos(')" class="function-button">cos</button>
                                    <button onclick="addFunction('tan(')" class="function-button">tan</button>
                                    <button onclick="addFunction('log(')" class="function-button">log</button>
                                    <button onclick="addFunction('ln(')" class="function-button">ln</button>

                                    <!-- الصف الثاني - دوال إضافية -->
                                    <button onclick="addFunction('sqrt(')" class="function-button">√</button>
                                    <button onclick="addToExpression('^')" class="function-button">x^y</button>
                                    <button onclick="addToExpression('(')" class="function-button">(</button>
                                    <button onclick="addToExpression(')')" class="function-button">)</button>
                                    <button onclick="clearDisplay()" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm">C</button>

                                    <!-- الصف الثالث - الأرقام والعمليات -->
                                    <button onclick="addToExpression('7')" class="calculator-button">7</button>
                                    <button onclick="addToExpression('8')" class="calculator-button">8</button>
                                    <button onclick="addToExpression('9')" class="calculator-button">9</button>
                                    <button onclick="addToExpression('/')" class="operator-button">÷</button>
                                    <button onclick="deleteLastChar()" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded text-lg">←</button>

                                    <button onclick="addToExpression('4')" class="calculator-button">4</button>
                                    <button onclick="addToExpression('5')" class="calculator-button">5</button>
                                    <button onclick="addToExpression('6')" class="calculator-button">6</button>
                                    <button onclick="addToExpression('*')" class="operator-button">×</button>
                                    <button onclick="addToExpression('e')" class="function-button">e</button>

                                    <button onclick="addToExpression('1')" class="calculator-button">1</button>
                                    <button onclick="addToExpression('2')" class="calculator-button">2</button>
                                    <button onclick="addToExpression('3')" class="calculator-button">3</button>
                                    <button onclick="addToExpression('-')" class="operator-button">-</button>
                                    <button onclick="addToExpression('pi')" class="function-button">π</button>

                                    <button onclick="addToExpression('0')" class="calculator-button">0</button>
                                    <button onclick="addToExpression('.')" class="calculator-button">.</button>
                                    <button onclick="calculate()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded text-lg">=</button>
                                    <button onclick="addToExpression('+')" class="operator-button">+</button>
                                    <button onclick="addToExpression('!')" class="function-button">n!</button>
                                </div>
                            </div>
                        </div>

                        <!-- السجل -->
                        <div class="lg:col-span-1">
                            <div class="bg-gray-100 rounded-lg p-4 h-full">
                                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <i class="fas fa-history ml-2"></i>
                                    سجل العمليات
                                    <button onclick="clearHistory()" class="mr-auto text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                                        مسح
                                    </button>
                                </h3>
                                <div id="history" class="space-y-2 max-h-[500px] overflow-y-auto">
                                    <p class="text-gray-500 text-center text-sm">لا توجد عمليات بعد</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- تبويب الرسوم البيانية -->
                <div id="content-graph" class="tab-content hidden">
                    <div class="space-y-6">
                        <!-- إدخال الدالة -->
                        <div class="bg-gray-50 rounded-lg p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-4">
                                <i class="fas fa-function ml-2"></i>
                                إدخال الدالة
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-gray-700 font-semibold mb-2">الدالة (بدلالة x)</label>
                                    <input type="text" id="function-input" 
                                           placeholder="مثال: sin(x), x^2, sqrt(x)"
                                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                           value="sin(x)">
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-2">من (x)</label>
                                        <input type="number" id="x-min" value="-10" 
                                               class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-2">إلى (x)</label>
                                        <input type="number" id="x-max" value="10" 
                                               class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    </div>
                                </div>
                            </div>
                            <button onclick="plotFunction()" 
                                    class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
                                <i class="fas fa-chart-line ml-2"></i>
                                رسم الدالة
                            </button>
                        </div>

                        <!-- أمثلة سريعة -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-700 mb-3">أمثلة سريعة:</h4>
                            <div class="flex flex-wrap gap-2">
                                <button onclick="setFunction('sin(x)')" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">sin(x)</button>
                                <button onclick="setFunction('cos(x)')" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">cos(x)</button>
                                <button onclick="setFunction('x^2')" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">x²</button>
                                <button onclick="setFunction('x^3')" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">x³</button>
                                <button onclick="setFunction('sqrt(x)')" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">√x</button>
                                <button onclick="setFunction('1/x')" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">1/x</button>
                                <button onclick="setFunction('log(x)')" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">log(x)</button>
                                <button onclick="setFunction('e^x')" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">e^x</button>
                            </div>
                        </div>

                        <!-- الرسم البياني -->
                        <div class="bg-white rounded-lg p-4 shadow-inner">
                            <canvas id="graph-canvas"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- تذييل -->
            <div class="text-center mt-8 text-gray-400">
                <p class="text-sm">
                    <i class="fas fa-info-circle ml-1"></i>
                    حاسبة علمية متقدمة تدعم جميع العمليات الحسابية والدوال الرياضية
                </p>
            </div>
        </div>

        <script src="/static/calculator.js"></script>
    </body>
    </html>
  `)
})

export default app
