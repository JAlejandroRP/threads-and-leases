import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const enResources = {
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    actions: 'Actions',
    view: 'View',
    details: 'Details',
    status: 'Status',
    price: 'Price',
    date: 'Date',
    search: 'Search',
    noResults: 'No results found',
    back: 'Back',
    next: 'Next',
    submit: 'Submit'
  },
  auth: {
    login: 'Log in',
    signup: 'Sign up',
    email: 'Email',
    password: 'Password',
    forgot: 'Forgot your password?',
    remember: 'Remember your password?',
    backToLogin: 'Back to login',
    createAccount: 'Create an account',
    enterEmail: 'Enter your email below to create your account',
    enterEmailAndPassword: 'Enter your email and password to log in',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signIn: 'Sign in',
    resetPassword: 'Reset password',
    resetPasswordDesc: 'Enter your email address and we\'ll send you a link to reset your password',
    sendResetLink: 'Send reset link',
    checkEmail: 'Check your email for a link to reset your password.'
  },
  rentals: {
    title: 'Rentals',
    createNew: 'Create New Rental',
    returnItem: 'Return Item',
    changeStatus: 'Change Status',
    updateStatus: 'Update Rental Status',
    delete: 'Delete Rental',
    deleteConfirm: 'Are you sure you want to delete this rental? This action cannot be undone.',
    customer: 'Customer',
    items: 'Item(s)',
    dates: 'Dates',
    mainItem: 'Main Item',
    additionalItems: 'Additional Items',
    rentalPeriod: 'Rental Period',
    totalPrice: 'Total Price',
    size: 'Size',
    unknown: 'Unknown',
    returnCondition: 'Return Condition',
    conditionUponReturn: 'Condition upon return',
    returnNotes: 'Notes',
    additionalFees: 'Additional Fees ($)',
    fees: 'fees',
    completeReturn: 'Complete Return',
    addNotes: 'Add any notes about the returned item',
    customerInfo: 'Customer Information',
    name: 'Name',
    rentalInfo: 'Rental Information',
    period: 'Period',
    newStatus: 'New Status',
    selectStatus: 'Select status',
    selectCondition: 'Select condition'
  },
  statuses: {
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending_adjustment: 'Pending Adjustment',
    pending_creation: 'Being Created',
    ready: 'Ready'
  },
  conditions: {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    damaged: 'Damaged',
    severely_damaged: 'Severely Damaged'
  },
  navigation: {
    dashboard: 'Dashboard',
    rentals: 'Rentals',
    inventory: 'Inventory',
    customers: 'Customers',
    settings: 'Settings',
    language: 'Language'
  }
};

// Spanish translations
const esResources = {
  common: {
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    actions: 'Acciones',
    view: 'Ver',
    details: 'Detalles',
    status: 'Estado',
    price: 'Precio',
    date: 'Fecha',
    search: 'Buscar',
    noResults: 'No se encontraron resultados',
    back: 'Atrás',
    next: 'Siguiente',
    submit: 'Enviar'
  },
  auth: {
    login: 'Iniciar sesión',
    signup: 'Registrarse',
    email: 'Correo electrónico',
    password: 'Contraseña',
    forgot: '¿Olvidaste tu contraseña?',
    remember: '¿Recuerdas tu contraseña?',
    backToLogin: 'Volver a iniciar sesión',
    createAccount: 'Crear una cuenta',
    enterEmail: 'Ingresa tu correo electrónico para crear tu cuenta',
    enterEmailAndPassword: 'Ingresa tu correo electrónico y contraseña para iniciar sesión',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    dontHaveAccount: '¿No tienes una cuenta?',
    signIn: 'Iniciar sesión',
    resetPassword: 'Restablecer contraseña',
    resetPasswordDesc: 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña',
    sendResetLink: 'Enviar enlace',
    checkEmail: 'Revisa tu correo electrónico para encontrar un enlace para restablecer tu contraseña.'
  },
  rentals: {
    title: 'Alquileres',
    createNew: 'Crear Nuevo Alquiler',
    returnItem: 'Devolver Artículo',
    changeStatus: 'Cambiar Estado',
    updateStatus: 'Actualizar Estado del Alquiler',
    delete: 'Eliminar Alquiler',
    deleteConfirm: '¿Estás seguro de que deseas eliminar este alquiler? Esta acción no se puede deshacer.',
    customer: 'Cliente',
    items: 'Artículo(s)',
    dates: 'Fechas',
    mainItem: 'Artículo Principal',
    additionalItems: 'Artículos Adicionales',
    rentalPeriod: 'Período de Alquiler',
    totalPrice: 'Precio Total',
    size: 'Talla',
    unknown: 'Desconocido',
    returnCondition: 'Condición de Devolución',
    conditionUponReturn: 'Condición al devolver',
    returnNotes: 'Notas',
    additionalFees: 'Cargos Adicionales ($)',
    fees: 'cargos',
    completeReturn: 'Completar Devolución',
    addNotes: 'Añade notas sobre el artículo devuelto',
    customerInfo: 'Información del Cliente',
    name: 'Nombre',
    rentalInfo: 'Información del Alquiler',
    period: 'Período',
    newStatus: 'Nuevo Estado',
    selectStatus: 'Seleccionar estado',
    selectCondition: 'Seleccionar condición'
  },
  statuses: {
    active: 'Activo',
    completed: 'Completado',
    cancelled: 'Cancelado',
    pending_adjustment: 'Ajuste Pendiente',
    pending_creation: 'En Creación',
    ready: 'Listo'
  },
  conditions: {
    excellent: 'Excelente',
    good: 'Bueno',
    fair: 'Regular',
    damaged: 'Dañado',
    severely_damaged: 'Severamente Dañado'
  },
  navigation: {
    dashboard: 'Panel',
    rentals: 'Alquileres',
    inventory: 'Inventario',
    customers: 'Clientes',
    settings: 'Configuración',
    language: 'Idioma'
  }
};

// Configure i18n
i18n
  .use(initReactI18next)
  .init({
    debug: true,
    resources: {
      en: { translation: enResources },
      es: { translation: esResources },
    },
    lng: 'es', // Default language
    // fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
