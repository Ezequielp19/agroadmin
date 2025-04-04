import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader,
  IonRow, IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { SubscriptionI } from 'src/app/common/models/suscription.model';
import { FirestoreService } from 'src/app/common/services/firestore.service';

@Component({
  selector: 'app-suscripcciones',
  templateUrl: './suscripcciones.component.html',
  styleUrls: ['./suscripcciones.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonButton, IonButtons, IonBackButton,
    IonTitle, IonContent, IonGrid, IonRow, IonCol
  ]
})
export class SuscripccionesComponent implements OnInit {
  subscriptions: SubscriptionI[] = [];
  filteredSubscriptions: SubscriptionI[] = [];
  paginatedSubscriptions: SubscriptionI[] = [];

  filtroEmail: string = '';
  filtroDni: string = '';
  filtroFecha: string = '';
  filtroEstado: string = '';

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor(private subscriptionService: FirestoreService) {}

  async ngOnInit() {
    await this.loadSubscriptions();
  }

  async loadSubscriptions() {
    try {
      this.subscriptions = await this.subscriptionService.getSubscriptions();
      this.applyFilters();
    } catch (error) {
      console.error('Error cargando suscripciones:', error);
    }
  }

  applyFilters() {
    this.filteredSubscriptions = this.subscriptions.filter((sub) => {
      const cumpleEmail = this.filtroEmail
        ? sub.email?.toLowerCase().includes(this.filtroEmail.toLowerCase())
        : true;

      const cumpleDni = this.filtroDni ? sub.dni?.includes(this.filtroDni) : true;

      const cumpleFecha = this.filtroFecha
        ? this.compareDates(sub.createdAt, this.filtroFecha)
        : true;

      const cumpleEstado = this.filtroEstado ? sub.status === this.filtroEstado : true;

      return cumpleEmail && cumpleDni && cumpleFecha && cumpleEstado;
    });

    this.totalPages = Math.ceil(this.filteredSubscriptions.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedList();
  }

  compareDates(subscriptionDate: string, filterDate: string): boolean {
    const formattedSubscriptionDate = formatDate(subscriptionDate, 'dd/MM/yyyy', 'en-US');
    return formattedSubscriptionDate === filterDate;
  }

  updatePaginatedList() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedSubscriptions = this.filteredSubscriptions.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedList();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedList();
    }
  }

  async deleteSubscription(subscription: SubscriptionI) {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la suscripción de ${subscription.email}?`
    );
    if (!confirmDelete) return;

    try {
      await this.subscriptionService.deleteSubscription(subscription.id);
      this.subscriptions = this.subscriptions.filter((s) => s.id !== subscription.id);
      this.applyFilters();
      window.alert('Suscripción eliminada con éxito.');
    } catch (error) {
      console.error('Error eliminando suscripción:', error);
      window.alert('Error al eliminar la suscripción.');
    }
  }
}
