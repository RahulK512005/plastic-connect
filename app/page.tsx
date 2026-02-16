'use client'

import { useState } from 'react'
import { RoleSelector } from '@/components/role-selector'
import { CollectorDashboard } from '@/components/collector-dashboard'
import { BuyerDashboard } from '@/components/buyer-dashboard'

export default function Page() {
  const [selectedRole, setSelectedRole] = useState<'collector' | 'buyer' | null>(null)

  if (!selectedRole) {
    return <RoleSelector onRoleSelect={setSelectedRole} />
  }

  return selectedRole === 'collector' ? (
    <CollectorDashboard />
  ) : (
    <BuyerDashboard />
  )
}
