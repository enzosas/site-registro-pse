import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { RegistroPSEProvider } from './context/RegistroPSEContext.jsx';
import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/buttons.css';
import './styles/outros.css';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<RegistroPSEProvider>
			<App />
		</RegistroPSEProvider>
	</StrictMode>
);