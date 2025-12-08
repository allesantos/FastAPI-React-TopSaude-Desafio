
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, FileText } from 'lucide-react';
import { Input, DocumentInput } from '../common/Input';
import { Modal, ModalFooter, ModalButton } from '../common/Modal';
import { useToast } from '../../contexts/ToastContext';
import { useApi } from '../../hooks/useApi';
import customerService from '../../services/customerService';
import type { Customer, CustomerCreate, CustomerUpdate } from '../../types';

// ==========================================
// VALIDAÇÃO COM ZOD
// ==========================================

// Função para validar CPF
const isValidCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false; // Rejeita sequências iguais
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(numbers.charAt(10))) return false;
  
  return true;
};

// Função para validar CNPJ
const isValidCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  // Validação simplificada do CNPJ
  let size = numbers.length - 2;
  let digits = numbers.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  digits = numbers.substring(size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

const customerSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  document: z
    .string()
    .refine(
      (doc) => {
        const numbers = doc.replace(/\D/g, '');
        return numbers.length === 11 || numbers.length === 14;
      },
      'Documento deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos)'
    )
    .refine(
      (doc) => {
        const numbers = doc.replace(/\D/g, '');
        if (numbers.length === 11) return isValidCPF(numbers);
        if (numbers.length === 14) return isValidCNPJ(numbers);
        return false;
      },
      'CPF ou CNPJ inválido'
    ),
});

type CustomerFormData = z.infer<typeof customerSchema>;

// ==========================================
// PROPS
// ==========================================

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null; // Se fornecido, é modo EDITAR
}

// ==========================================
// CUSTOMER FORM COMPONENT
// ==========================================

export const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customer,
}) => {
  const toast = useToast();
  const { loading, execute } = useApi<Customer>();

  // ==========================================
  // REACT HOOK FORM
  // ==========================================

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      document: '',
    },
  });

  // Watch document for DocumentInput
  const documentValue = watch('document');

  // ==========================================
  //  PREENCHER FORM SE FOR EDIÇÃO
  // ==========================================

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email,
        document: customer.document,
      });
    } else {
      reset({
        name: '',
        email: '',
        document: '',
      });
    }
  }, [customer, reset]);

  // ==========================================
  // SUBMIT
  // ==========================================

  const onSubmit = async (data: CustomerFormData) => {
    try {
      // Remove formatação do documento (apenas números)
      const cleanDocument = data.document.replace(/\D/g, '');

      let result;

      if (customer) {
        // EDITAR cliente existente
        const updateData: CustomerUpdate = {
          name: data.name,
          email: data.email,
          document: cleanDocument,
        };

        result = await execute(() =>
          customerService.updateCustomer(customer.id, updateData)
        );

        if (result) {
          toast.success('Cliente atualizado!', 'As alterações foram salvas com sucesso.');
          onSuccess();
          onClose();
        }
      } else {
        // CRIAR novo cliente
        const createData: CustomerCreate = {
          name: data.name,
          email: data.email,
          document: cleanDocument,
        };

        result = await execute(() =>
          customerService.createCustomer(createData)
        );

        if (result) {
          toast.success('Cliente criado!', `${data.name} foi adicionado com sucesso.`);
          onSuccess();
          onClose();
        }
      }
    } catch (error: any) {
      toast.error('Erro ao salvar cliente', error.message || 'Tente novamente.');
    }
  };

  // ==========================================
  // CANCELAR
  // ==========================================

  const handleCancel = () => {
    reset();
    onClose();
  };

  // ==========================================
  //  RENDER
  // ==========================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={customer ? '✏️ Editar Cliente' : '➕ Novo Cliente'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5">
          {/* Nome */}
          <Input
            label="Nome Completo"
            placeholder="Ex: João da Silva"
            error={errors.name?.message}
            leftIcon={<User className="w-5 h-5" />}
            required
            {...register('name')}
          />

          {/* Email */}
          <Input
            label="Email"
            type="email"
            placeholder="Ex: joao@email.com"
            error={errors.email?.message}
            leftIcon={<Mail className="w-5 h-5" />}
            required
            {...register('email')}
          />

          {/* Documento (CPF/CNPJ) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              CPF ou CNPJ
              <span className="text-red-500 ml-1">*</span>
            </label>
            <DocumentInput
              value={documentValue}
              onChange={(value) => setValue('document', value)}
              error={errors.document?.message}
              leftIcon={<FileText className="w-5 h-5" />}
              hint="Digite apenas os números"
            />
          </div>

          {/* Preview dos dados (Dev mode) */}
          {import.meta.env.DEV && (
            <div className="bg-gray-50 p-3 rounded-lg text-xs">
              <p className="font-mono text-gray-600">
                Preview: {watch('name')} | {watch('email')} | Doc: {watch('document')}
              </p>
            </div>
          )}
        </div>

        {/* Footer com Botões */}
        <ModalFooter>
          <ModalButton variant="secondary" onClick={handleCancel} disabled={loading}>
            Cancelar
          </ModalButton>
          <ModalButton variant="primary" type="submit" loading={loading}>
            {customer ? 'Salvar Alterações' : 'Criar Cliente'}
          </ModalButton>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default CustomerForm;