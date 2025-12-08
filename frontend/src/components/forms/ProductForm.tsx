
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, DollarSign, Archive } from 'lucide-react';
import { Input, Select, PriceInput } from '../common/Input';
import { Modal, ModalFooter, ModalButton } from '../common/Modal';
import { useToast } from '../../contexts/ToastContext';
import { useApi } from '../../hooks/useApi';
import productService from '../../services/productService';
import type { Product, ProductCreate, ProductUpdate } from '../../types';

// ==========================================
// VALIDAÇÃO COM ZOD
// ==========================================

const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  sku: z
    .string()
    .min(3, 'SKU deve ter pelo menos 3 caracteres')
    .max(50, 'SKU deve ter no máximo 50 caracteres')
    .regex(/^[A-Z0-9]+$/, 'SKU deve conter apenas letras maiúsculas e números'),
  price: z
    .number()
    .min(0.01, 'Preço deve ser maior que zero')
    .max(999999.99, 'Preço inválido'),
  stock_qty: z
    .number()
    .int('Estoque deve ser um número inteiro')
    .min(0, 'Estoque não pode ser negativo')
    .max(999999, 'Estoque inválido'),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

// ==========================================
// PROPS
// ==========================================

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null; // Se fornecido, é modo EDITAR
}

// ==========================================
// PRODUCT FORM COMPONENT
// ==========================================

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}) => {
  const toast = useToast();
  const { loading, execute } = useApi<Product>();

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
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      stock_qty: 0,
      is_active: true,
    },
  });

  // Watch price for PriceInput
  const priceValue = watch('price');

  // ==========================================
  // PREENCHER FORM SE FOR EDIÇÃO
  // ==========================================

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock_qty: product.stock_qty,
        is_active: product.is_active,
      });
    } else {
      reset({
        name: '',
        sku: '',
        price: 0,
        stock_qty: 0,
        is_active: true,
      });
    }
  }, [product, reset]);

  // ==========================================
  // SUBMIT
  // ==========================================

  const onSubmit = async (data: ProductFormData) => {
    try {
      let result;

      if (product) {
        // EDITAR produto existente
        const updateData: ProductUpdate = {
          name: data.name,
          sku: data.sku,
          price: data.price,
          stock_qty: data.stock_qty,
          is_active: data.is_active,
        };

        result = await execute(() =>
          productService.updateProduct(product.id, updateData)
        );

        if (result) {
          toast.success('Produto atualizado!', 'As alterações foram salvas com sucesso.');
          onSuccess();
          onClose();
        }
      } else {
        // CRIAR novo produto
        const createData: ProductCreate = {
          name: data.name,
          sku: data.sku,
          price: data.price,
          stock_qty: data.stock_qty,
          is_active: data.is_active,
        };

        result = await execute(() =>
          productService.createProduct(createData)
        );

        if (result) {
          toast.success('Produto criado!', `${data.name} foi adicionado ao catálogo.`);
          onSuccess();
          onClose();
        }
      }
    } catch (error: any) {
      toast.error('Erro ao salvar produto', error.message || 'Tente novamente.');
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
  // RENDER
  // ==========================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={product ? '✏️ Editar Produto' : '➕ Novo Produto'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5">
          {/* Nome do Produto */}
          <Input
            label="Nome do Produto"
            placeholder="Ex: Vitamina D 2000UI"
            error={errors.name?.message}
            leftIcon={<Package className="w-5 h-5" />}
            required
            {...register('name')}
          />

          {/* SKU */}
          <Input
            label="SKU (Código)"
            placeholder="Ex: VIT002"
            hint="Apenas letras maiúsculas e números"
            error={errors.sku?.message}
            leftIcon={<Archive className="w-5 h-5" />}
            required
            {...register('sku', {
              onChange: (e) => {
                // Converte para maiúsculas automaticamente
                e.target.value = e.target.value.toUpperCase();
              },
            })}
          />

          {/* Preço e Estoque (Grid) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Preço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Preço
                <span className="text-red-500 ml-1">*</span>
              </label>
              <PriceInput
                value={priceValue}
                onChange={(value) => setValue('price', value)}
                error={errors.price?.message}
                leftIcon={<DollarSign className="w-5 h-5" />}
              />
            </div>

            {/* Estoque */}
            <Input
              label="Estoque"
              type="number"
              placeholder="0"
              error={errors.stock_qty?.message}
              leftIcon={<Package className="w-5 h-5" />}
              required
              {...register('stock_qty', { valueAsNumber: true })}
            />
          </div>

          {/* Status Ativo */}
          <Select
            label="Status"
            error={errors.is_active?.message}
            options={[
              { value: 'true', label: '✅ Ativo' },
              { value: 'false', label: '❌ Inativo' },
            ]}
            required
            {...register('is_active', {
              setValueAs: (value) => value === 'true',
            })}
          />

          {/* Preview dos dados (Dev mode) */}
          {import.meta.env.DEV && (
            <div className="bg-gray-50 p-3 rounded-lg text-xs">
              <p className="font-mono text-gray-600">
                Preview: {watch('name')} | {watch('sku')} | R$ {watch('price').toFixed(2)} | Estoque: {watch('stock_qty')}
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
            {product ? 'Salvar Alterações' : 'Criar Produto'}
          </ModalButton>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default ProductForm;