/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// === هوية جدارة اللونية: كحلي عميق + ذهبي راقٍ ===
  			// استبدال لوحي violet/indigo/cyan/teal/sky الافتراضية بمزيج كحلي+ذهبي
  			// ينعكس تلقائياً على كل مكان يستخدم هذه الأصناف في صفحة الهبوط وبوابات الموظف والشركات والمدونة.
  			violet: {  // ← تُستخدم للأزرار/التمييزات الأساسية → ذهبي راقٍ
  				'50': '#FBF7EC', '100': '#F6ECC8', '200': '#EBD69E', '300': '#DBC364',
  				'400': '#CBA83A', '500': '#B6901F', '600': '#9A741E', '700': '#7A5B16',
  				'800': '#5A4010', '900': '#3A2A09'
  			},
  			indigo: {  // ← تُستخدم للخلطات والظلال → كحلي عميق
  				'50': '#EEF3F8', '100': '#D9E2F0', '200': '#AFC2DF', '300': '#7E9BC8',
  				'400': '#4F73A8', '500': '#2E5388', '600': '#1E3B66', '700': '#142C4F',
  				'800': '#0E2138', '900': '#0B2545'
  			},
  			cyan: {  // ← التركوازي القديم → ذهبي راقٍ
  				'50': '#FBF7EC', '100': '#F6ECC8', '200': '#EBD69E', '300': '#DBC364',
  				'400': '#CBA83A', '500': '#B6901F', '600': '#9A741E', '700': '#7A5B16',
  				'800': '#5A4010', '900': '#3A2A09'
  			},
  			teal: {
  				'50': '#FBF7EC', '100': '#F6ECC8', '200': '#EBD69E', '300': '#DBC364',
  				'400': '#CBA83A', '500': '#B6901F', '600': '#9A741E', '700': '#7A5B16',
  				'800': '#5A4010', '900': '#3A2A09'
  			},
  			sky: {
  				'50': '#FBF7EC', '100': '#F6ECC8', '200': '#EBD69E', '300': '#DBC364',
  				'400': '#CBA83A', '500': '#B6901F', '600': '#9A741E', '700': '#7A5B16',
  				'800': '#5A4010', '900': '#3A2A09'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
