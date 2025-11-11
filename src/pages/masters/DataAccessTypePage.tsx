import React from 'react';
import { MasterScreen } from '@/components/common/MasterScreen';

const DataAccessTypePage: React.FC = () => {
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      filterable: true,
      filterType: 'text'
    },
    {
      key: 'dataAccessTypeName',
      label: 'Data Access Type Name',
      sortable: true,
      filterable: true,
      filterType: 'text'
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      filterable: true,
      filterType: 'text'
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row: any) => (row.isActive ? 
        <span className='text-green-600 font-sm'>Active</span> : 
        <span className='text-red-600 font-sm'>Inactive</span>
      ),
      sortable: true,
      filterable: true,
    }
  ];

  const formFields = [
    {
      name: 'dataAccessTypeName',
      label: 'Data Access Type Name',
      type: 'text',
      placeholder: 'Enter access type name',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
        errorMessage: 'Access type name must be between 2 and 100 characters'
      }
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Enter description',
      required: false,
      validation: {
        maxLength: 500,
        errorMessage: 'Description must not exceed 500 characters'
      }
    },
    {
      name: 'isActive',
      label: 'Active Status',
      type: 'checkbox',
      required: false,
    }
  ];

  return (
    <MasterScreen
      title="Data Access Type"
      endpoint="data_access_type"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Search data access types by code, name..."
    />
  );
};

export default DataAccessTypePage;