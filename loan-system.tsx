"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calculator,
  CreditCard,
  User,
  DollarSign,
  Calendar,
  Percent,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react"

interface PaymentSchedule {
  paymentNumber: number
  dueDate: Date
  amount: number
  isPaid: boolean
  paidDate?: Date
}

interface Loan {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  amount: number
  term: number // meses
  interestRate: number // porcentaje mensual
  monthlyPayment: number
  totalPayment: number
  createdAt: Date
  paymentSchedule: PaymentSchedule[]
}

export default function LoanSystem() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    amount: "",
    term: "",
    interestRate: "",
  })

  // Opciones predefinidas
  const termOptions = [
    { value: "6", label: "6 meses" },
    { value: "12", label: "12 meses" },
    { value: "18", label: "18 meses" },
    { value: "24", label: "24 meses" },
    { value: "36", label: "36 meses" },
    { value: "48", label: "48 meses" },
  ]

  const interestOptions = [
    { value: "10", label: "10% mensual" },
    { value: "15", label: "15% mensual" },
    { value: "20", label: "20% mensual" },
  ]

  // Calcular pago mensual usando tasa mensual directa
  const calculateMonthlyPayment = (principal: number, monthlyRate: number, months: number) => {
    const rate = monthlyRate / 100
    if (rate === 0) return principal / months

    const monthlyPayment = (principal * (rate * Math.pow(1 + rate, months))) / (Math.pow(1 + rate, months) - 1)
    return monthlyPayment
  }

  // Generar cronograma de pagos
  const generatePaymentSchedule = (startDate: Date, monthlyPayment: number, term: number): PaymentSchedule[] => {
    const schedule: PaymentSchedule[] = []

    for (let i = 1; i <= term; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + i)

      schedule.push({
        paymentNumber: i,
        dueDate,
        amount: monthlyPayment,
        isPaid: false,
      })
    }

    return schedule
  }

  // Determinar el estado del pago
  const getPaymentStatus = (payment: PaymentSchedule) => {
    const today = new Date()
    const dueDate = new Date(payment.dueDate)
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (payment.isPaid) {
      return { status: "paid", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle }
    } else if (daysDiff < 0) {
      return { status: "overdue", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle }
    } else if (daysDiff <= 7) {
      return { status: "due-soon", color: "text-orange-600", bgColor: "bg-orange-50", icon: AlertTriangle }
    } else {
      return { status: "pending", color: "text-gray-600", bgColor: "bg-gray-50", icon: Clock }
    }
  }

  // Calcular preview dinámico
  const getPreviewCalculation = () => {
    const amount = Number.parseFloat(formData.amount) || 0
    const term = Number.parseInt(formData.term) || 0
    const monthlyRate = Number.parseFloat(formData.interestRate) || 0

    if (amount > 0 && term > 0 && monthlyRate > 0) {
      const monthlyPayment = calculateMonthlyPayment(amount, monthlyRate, term)
      const totalPayment = monthlyPayment * term
      return {
        monthlyPayment: monthlyPayment,
        totalPayment: totalPayment,
        totalInterest: totalPayment - amount,
      }
    }
    return null
  }

  // Marcar pago como completado
  const togglePayment = (loanId: string, paymentNumber: number) => {
    setLoans(
      loans.map((loan) => {
        if (loan.id === loanId) {
          const updatedSchedule = loan.paymentSchedule.map((payment) => {
            if (payment.paymentNumber === paymentNumber) {
              return {
                ...payment,
                isPaid: !payment.isPaid,
                paidDate: !payment.isPaid ? new Date() : undefined,
              }
            }
            return payment
          })
          return { ...loan, paymentSchedule: updatedSchedule }
        }
        return loan
      }),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = Number.parseFloat(formData.amount)
    const term = Number.parseInt(formData.term)
    const rate = Number.parseFloat(formData.interestRate)

    if (!formData.clientName || !formData.clientEmail || !amount || !term || !rate) {
      alert("Por favor completa todos los campos")
      return
    }

    const monthlyPayment = calculateMonthlyPayment(amount, rate, term)
    const totalPayment = monthlyPayment * term
    const createdAt = new Date()
    const paymentSchedule = generatePaymentSchedule(createdAt, monthlyPayment, term)

    const newLoan: Loan = {
      id: Date.now().toString(),
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      amount,
      term,
      interestRate: rate,
      monthlyPayment,
      totalPayment,
      createdAt,
      paymentSchedule,
    }

    setLoans([newLoan, ...loans])

    // Limpiar formulario
    setFormData({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      amount: "",
      term: "",
      interestRate: "",
    })
  }

  const previewCalc = getPreviewCalculation()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Préstamos</h1>
          <p className="text-gray-600">Gestiona préstamos con cálculos automáticos y seguimiento de pagos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Nuevo Préstamo
              </CardTitle>
              <CardDescription>Completa los datos del cliente y las condiciones del préstamo</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Datos del Cliente */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4" />
                    Datos del Cliente
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="clientName">Nombre Completo *</Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Email *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        placeholder="juan@email.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientPhone">Teléfono</Label>
                      <Input
                        id="clientPhone"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Condiciones del Préstamo */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CreditCard className="h-4 w-4" />
                    Condiciones del Préstamo
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="amount">Monto del Préstamo *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="10000"
                        min="1000"
                        step="100"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="term">Plazo *</Label>
                      <Select
                        value={formData.term}
                        onValueChange={(value) => setFormData({ ...formData, term: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el plazo" />
                        </SelectTrigger>
                        <SelectContent>
                          {termOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="interestRate">Tasa de Interés Mensual *</Label>
                      <Select
                        value={formData.interestRate}
                        onValueChange={(value) => setFormData({ ...formData, interestRate: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la tasa" />
                        </SelectTrigger>
                        <SelectContent>
                          {interestOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Preview de Cálculos */}
                {previewCalc && (
                  <>
                    <Separator />
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <h4 className="font-medium text-blue-900">Preview de Cálculos</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">Pago Mensual:</span>
                          <p className="font-semibold text-blue-900">
                            ${previewCalc.monthlyPayment.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <span className="text-blue-700">Total a Pagar:</span>
                          <p className="font-semibold text-blue-900">
                            ${previewCalc.totalPayment.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-blue-700">Total de Intereses:</span>
                          <p className="font-semibold text-blue-900">
                            ${previewCalc.totalInterest.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Crear Préstamo
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Lista de Préstamos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Préstamos Activos</h2>
              <Badge variant="secondary">{loans.length} préstamos</Badge>
            </div>

            {loans.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    No hay préstamos creados aún.
                    <br />
                    Completa el formulario para crear tu primer préstamo.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6 max-h-[800px] overflow-y-auto">
                {loans.map((loan) => {
                  const overduePaiments = loan.paymentSchedule.filter(
                    (p) => !p.isPaid && new Date(p.dueDate) < new Date(),
                  ).length
                  const paidPayments = loan.paymentSchedule.filter((p) => p.isPaid).length

                  return (
                    <Card key={loan.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {loan.clientName}
                              {overduePaiments > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {overduePaiments} en mora
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{loan.clientEmail}</CardDescription>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{loan.createdAt.toLocaleDateString()}</Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {paidPayments}/{loan.term} pagos completados
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm text-gray-600">Monto</p>
                              <p className="font-semibold">${loan.amount.toLocaleString("es-ES")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-600">Plazo</p>
                              <p className="font-semibold">{loan.term} meses</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="text-sm text-gray-600">Tasa</p>
                              <p className="font-semibold">{loan.interestRate}% mensual</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calculator className="h-4 w-4 text-purple-600" />
                            <div>
                              <p className="text-sm text-gray-600">Pago Mensual</p>
                              <p className="font-semibold text-purple-700">
                                ${loan.monthlyPayment.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Timeline de Pagos */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Cronograma de Pagos
                          </h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {loan.paymentSchedule.map((payment) => {
                              const status = getPaymentStatus(payment)
                              const StatusIcon = status.icon

                              return (
                                <div
                                  key={payment.paymentNumber}
                                  className={`flex items-center justify-between p-3 rounded-lg border ${status.bgColor} ${
                                    status.status === "overdue"
                                      ? "border-red-200"
                                      : status.status === "due-soon"
                                        ? "border-orange-200"
                                        : status.status === "paid"
                                          ? "border-green-200"
                                          : "border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={payment.isPaid}
                                      onCheckedChange={() => togglePayment(loan.id, payment.paymentNumber)}
                                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <div>
                                      <p className="font-medium text-sm">Pago #{payment.paymentNumber}</p>
                                      <p className="text-xs text-gray-600">
                                        Vence: {payment.dueDate.toLocaleDateString()}
                                      </p>
                                      {payment.isPaid && payment.paidDate && (
                                        <p className="text-xs text-green-600">
                                          Pagado: {payment.paidDate.toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <p className="font-semibold text-sm">
                                        ${payment.amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                                      </p>
                                      <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                                        <StatusIcon className="h-3 w-3" />
                                        <span>
                                          {status.status === "paid"
                                            ? "Pagado"
                                            : status.status === "overdue"
                                              ? "Vencido"
                                              : status.status === "due-soon"
                                                ? "Por vencer"
                                                : "Pendiente"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">Total a Pagar</p>
                            <p className="text-lg font-bold text-gray-900">
                              ${loan.totalPayment.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Intereses</p>
                            <p className="text-lg font-semibold text-red-600">
                              ${(loan.totalPayment - loan.amount).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
