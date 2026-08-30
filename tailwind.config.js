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
  			violet: {  // ← التمييز الأساسي → لبني/بنفسجي راقٍ
  				'50': '#F5F2FC', '100': '#EDE7F9', '200': '#DCD2F4', '300': '#C4B5FD',
  				'400': '#A78BFA', '500': '#8B5CF6', '600': '#7C5CE6', '700': '#6D45D6',
  				'800': '#5B3FD6', '900': '#4C2FB8'
  			},
  			indigo: {  // ← الخلطات والظلال → بنفسجي عميق متناسق
  				'50': '#F1F0FB', '100': '#E5E4F7', '200': '#CBC9EE', '300': '#ABA7DF',
  				'400': '#857FCC', '500': '#6959B5', '600': '#5547A0', '700': '#423884',
  				'800': '#312B6A', '900': '#241E54'
  			},
  			cyan: {  // ← لبني فاتح للحواف الناعمة
  				'50': '#F5F2FC', '100': '#EDE7F9', '200': '#DCD2F4', '300': '#C4B5FD',
  				'400': '#A78BFA', '500': '#8B5CF6', '600': '#7C5CE6', '700': '#6D45D6',
  				'800': '#5B3FD6', '900': '#4C2FB8'
  			},
  			teal: {
  				'50': '#F5F2FC', '100': '#EDE7F9', '200': '#DCD2F4', '300': '#C4B5FD',
  				'400': '#A78BFA', '500': '#8B5CF6', '600': '#7C5CE6', '700': '#6D45D6',
  				'800': '#5B3FD6', '900': '#4C2FB8'
  			},
  			sky: {
  				'50': '#F5F2FC', '100': '#EDE7F9', '200': '#DCD2F4', '300': '#C4B5FD',
  				'400': '#A78BFA', '500': '#8B5CF6', '600': '#7C5CE6', '700': '#6D45D6',
  				'800': '#5B3FD6', '900': '#4C2FB8'
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
